import { FIRESTORE_COLLECTIONS } from "./constants/firebaseConstants";
import {
    Dictionary,
    FirebaseComposition,
    FirebaseGradient,
    FirebaseObject,
    FirebaseRecipe,
    RegionObject,
    RefsByCollection,
    ViewableRecipe,
    ViewableComposition,
    ViewableGradient,
    ViewableObject
} from "./types";

const isFirebaseRef = (x: string | null | undefined) => {
    return x !== null && x !== undefined && typeof x == "string" && x.startsWith("firebase");
}

const isInRefsByCollection = (ref: string, coll: string, refsByColl: RefsByCollection): boolean => {
    let refsForColl = {};
    if (coll === FIRESTORE_COLLECTIONS.RECIPES) {
        refsForColl = refsByColl.recipes;
    } else if (coll === FIRESTORE_COLLECTIONS.COMPOSITION) {
        refsForColl = refsByColl.composition;
    } else if (coll === FIRESTORE_COLLECTIONS.OBJECTS) {
        refsForColl = refsByColl.objects;
    } else if (coll === FIRESTORE_COLLECTIONS.GRADIENTS) {
        refsForColl = refsByColl.gradients;
    } else {
        return false;
    }
    return ref in refsForColl;
}

const addRef = (
    ref: string,
    coll: string,
    obj: FirebaseRecipe | FirebaseComposition | FirebaseObject | FirebaseGradient,
    refsByColl: RefsByCollection
): RefsByCollection => {
    if (coll === FIRESTORE_COLLECTIONS.RECIPES) {
        refsByColl.recipes[ref] = obj;
    } else if (coll === FIRESTORE_COLLECTIONS.COMPOSITION) {
        refsByColl.composition[ref] = obj;
    } else if (coll === FIRESTORE_COLLECTIONS.OBJECTS) {
        refsByColl.objects[ref] = obj;
    } else if (coll === FIRESTORE_COLLECTIONS.GRADIENTS) {
        refsByColl.gradients[ref] = obj;
    }
    return refsByColl;
}

const isDbDict = (x: object) => {
    if (typeof x == "object" && Object.keys(x).length > 0) {
        for (const [key, value] of Object.entries(x)) {
            if (isNaN(Number(key)) || !Array.isArray(value)) {
                return false;
            }
        }
        return true;
    }
    return false;
}

const resolveRefsInObject = (
    obj: FirebaseObject,
    refsDict: RefsByCollection,
    fullDoc: FirebaseRecipe
) => {
    if (isFirebaseRef(obj.gradient)) {
        const gradientObj: FirebaseGradient = refsDict.gradients[obj.gradient!];
        obj.gradient = gradientObj.name;
        fullDoc.gradients ??= {};
        fullDoc.gradients[gradientObj.name] = gradientObj;
    }

    if (isFirebaseRef(obj.inherit)) {
        const objectObj: FirebaseObject = refsDict.objects[obj.inherit!];
        obj.inherit = objectObj.name;
        fullDoc.objects ??= {};
        fullDoc.objects[objectObj.name] = resolveRefsInObject(objectObj, refsDict, fullDoc);
    }

    return obj;
};

const resolveRefsInComposition = (
    compObj: FirebaseComposition,
    refsDict: RefsByCollection,
    fullDoc: FirebaseRecipe
) => {
    if (isFirebaseRef(compObj.object)) {
        const objectObj: FirebaseObject = refsDict.objects[compObj.object!];
        compObj.object = objectObj.name;
        fullDoc.objects ??= {};
        fullDoc.objects[objectObj.name] = resolveRefsInObject(objectObj, refsDict, fullDoc);
    }
    if (compObj.regions) {
        for (const regionData of Object.values(compObj.regions)) {
            for (let i = 0; i < regionData.length; i++) {
                const regionObj: string | RegionObject = regionData[i];
                if (typeof regionObj === 'string' && isFirebaseRef(regionObj)) {
                    // This reference is to another composition object
                    const inheritCompObj = refsDict.composition[regionObj];
                    regionData[i] = inheritCompObj.name;
                }
                else if (regionObj instanceof Object && isFirebaseRef(regionObj.object)) {
                    const obj: FirebaseObject = refsDict.objects[regionObj.object];
                    fullDoc.objects ??= {};
                    regionObj.object = obj.name;
                    fullDoc.objects[obj.name] = resolveRefsInObject(obj, refsDict, fullDoc);
                }
            }
        }
    }
    return compObj;
}

const recipeToViewable = (recipe: FirebaseRecipe): ViewableRecipe => {
    const viewableComp: Dictionary<ViewableComposition> = {};
    for (const key in recipe.composition) {
        const comp: FirebaseComposition = recipe.composition[key];
        const {name, id, dedup_hash, ...viewable} = comp;
        viewableComp[key] = viewable;
    }
    const viewableObj: Dictionary<ViewableObject> = {};
    for (const key in recipe.objects) {
        const obj: FirebaseObject = recipe.objects[key];
        const {name, id, dedup_hash, ...viewable} = obj;
        viewableObj[key] = viewable;
    }
    const viewableGradient: Dictionary<ViewableGradient> = {};
    for (const key in recipe.gradients) {
        const obj: FirebaseGradient = recipe.gradients[key];
        const {name, id, dedup_hash, ...viewable} = obj;
        viewableGradient[key] = viewable;
    }
    const viewableRecipe: ViewableRecipe = {
        name: recipe.name,
        version: recipe.version,
        format_version: recipe.format_version,
        bounding_box: recipe.bounding_box,
        grid_file_path: recipe.grid_file_path,
        composition: viewableComp,
        objects: viewableObj,
        gradients: viewableGradient,
    };
    return viewableRecipe;

}

const resolveRefs = (
    doc: FirebaseRecipe,
    refsDict: RefsByCollection
): ViewableRecipe => {
    // Handle Compositions
    for (const compName in doc.composition) {
        const ref = doc.composition[compName].inherit;
        if (isFirebaseRef(ref)) {
            const compositionObj: FirebaseComposition = refsDict.composition[ref!];
            doc.composition[compName] = resolveRefsInComposition(compositionObj, refsDict, doc);
        }
    }
    if (doc.bounding_box && isDbDict(doc.bounding_box)) {
        const unpackedDict: [][] = [[]]
        for (const [k, v] of Object.entries(doc.bounding_box)) {
            unpackedDict[Number(k)] = v;
        }
        doc.bounding_box = unpackedDict;
    }
    const viewable: ViewableRecipe = recipeToViewable(doc);
    return viewable;
}

export { isFirebaseRef, resolveRefs, isInRefsByCollection, addRef };