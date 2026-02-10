import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    query,
    getDocs,
    where,
    documentId,
    QuerySnapshot,
    DocumentData,
    setDoc,
    doc,
    Timestamp,
    deleteDoc,
} from "firebase/firestore";
import { sortBy } from "lodash-es";
import {
    FIREBASE_CONFIG,
    FIRESTORE_COLLECTIONS,
    FIRESTORE_FIELDS,
    RETENTION_POLICY,
} from "../constants/firebase";
import {
    FirestoreDoc,
    Dictionary,
    EditableField,
    JobStatusObject,
    RecipeData,
    RecipeManifest,
} from "../types";
import { getFirebaseRecipe } from "./recipeLoader";

const getEnvVar = (key: string): string => {
    // check if we're in a browser environment (Vite)
    if (typeof window !== "undefined" && import.meta.env) {
        return import.meta.env[key] || "";
    }
    // check if we're in Node.js environment (GitHub Actions)
    if (typeof process !== "undefined" && process.env) {
        return process.env[key] || "";
    }
    return "";
};

const firebaseConfig = {
    apiKey: getEnvVar("API_KEY"),
    authDomain: FIREBASE_CONFIG.AUTH_DOMAIN,
    projectId: FIREBASE_CONFIG.PROJECT_ID,
    storageBucket: FIREBASE_CONFIG.STORAGE_BUCKET,
    messagingSenderId: getEnvVar("MESSAGING_SENDER_ID"),
    appId: getEnvVar("APP_ID"),
    measurementId: getEnvVar("MEASUREMENT_ID"),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Generic firestore query functions
const queryDocumentById = async (collectionName: string, id: string) => {
    const q = query(
        collection(db, collectionName),
        where(documentId(), "==", id)
    );
    return await getDocs(q);
};

const queryDocumentsByIds = async (collectionName: string, ids: string[]) => {
    const q = query(
        collection(db, collectionName),
        where(documentId(), "in", ids)
    );
    return await getDocs(q);
};

const queryAllDocuments = async (collectionName: string) => {
    const q = query(collection(db, collectionName));
    return await getDocs(q);
};

const queryDocumentsByTime = async (
    collectionName: string,
    field: string,
    operator: "<" | "<=" | "==" | "!=" | ">=" | ">",
    value: Timestamp
) => {
    const q = query(
        collection(db, collectionName),
        where(field, operator, value)
    );
    return await getDocs(q);
};

const mapQuerySnapshotToDocs = (querySnapshot: QuerySnapshot<DocumentData>) => {
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as FirestoreDoc[];
};

// Query functions for our use case using generic functions
const getJobStatus = async (
    jobId: string
): Promise<JobStatusObject | undefined> => {
    const querySnapshot = await queryDocumentById(
        FIRESTORE_COLLECTIONS.JOB_STATUS,
        jobId
    );
    const docs = querySnapshot.docs.map((doc) => ({
        status: doc.data().status,
        error_message: doc.data().error_message,
        outputs_directory: doc.data().outputs_directory,
        result_path: doc.data().result_path,
    }));
    return docs[0] || undefined;
};

const getAllDocsFromCollection = async (collectionName: string) => {
    const querySnapshot = await queryAllDocuments(collectionName);
    return mapQuerySnapshotToDocs(querySnapshot);
};

const getEditableFieldsList = async (
    editable_field_ids: string[]
): Promise<EditableField[] | undefined> => {
    if (editable_field_ids.length === 0) {
        return undefined;
    }
    const querySnapshot = await queryDocumentsByIds(
        FIRESTORE_COLLECTIONS.EDITABLE_FIELDS,
        editable_field_ids
    );
    const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        data_type: doc.data().data_type,
        input_type: doc.data().input_type,
        description: doc.data().description,
        min: doc.data().min,
        max: doc.data().max,
        options: doc.data().options,
        gradient_options: doc.data().gradient_options,
        path: doc.data().path,
        conversion_factor: doc.data().conversion_factor,
        unit: doc.data().unit,
    }));
    const sortedDocs = sortBy(docs, "name");
    return sortedDocs;
};

/**
 * These RecipeManifest fields are queried as a group, and quick to retrieve from the backend.
 * Slower loading fields are defined as RecipeData and queried individually.
 */
const getRecipeManifestFromFirebase = async (): Promise<
    Record<string, RecipeManifest>
> => {
    const docs = await getAllDocsFromCollection(
        FIRESTORE_COLLECTIONS.PACKING_INPUTS
    );
    const inputsDict: Dictionary<RecipeManifest> = {};
    for (const doc of docs) {
        const displayName = doc[FIRESTORE_FIELDS.NAME];
        const config = doc[FIRESTORE_FIELDS.CONFIG];
        const recipeId = doc[FIRESTORE_FIELDS.RECIPE];
        const editableFieldIds = doc[FIRESTORE_FIELDS.EDITABLE_FIELDS];
        const defaultResultPath = doc[FIRESTORE_FIELDS.RESULT_PATH] || "";

        if (displayName && config && recipeId) {
            inputsDict[recipeId] = {
                recipeId: recipeId,
                configId: config,
                displayName,
                editableFieldIds: editableFieldIds || [],
                defaultResultPath,
            };
        }
    }
    return inputsDict;
};

/**
 * Retrieves both the recipe and its editable fields from Firebase for a given recipe ID and list of editable field IDs.
 * This process is slower than retrieving manifests and should be called when full recipe data is required. Returns a RecipeData object.
 */
const getRecipeDataFromFirebase = async (
    recipeId: string,
    editableFieldIds: string[]
): Promise<RecipeData> => {
    const defaultRecipe = await getFirebaseRecipe(recipeId);
    const editableFields =
        (await getEditableFieldsList(editableFieldIds)) || [];
    return {
        recipeId,
        defaultRecipe,
        editableFields,
        edits: {},
    };
};

const getDocsByIds = async (coll: string, ids: string[]) => {
    const querySnapshot = await queryDocumentsByIds(coll, ids);
    const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        dedup_hash: doc.data().dedup_hash,
        ...doc.data(),
    }));
    return docs;
};

const addRecipe = async (id: string, data: object) => {
    const timestampedData = {
        ...data,
        [FIRESTORE_FIELDS.TIMESTAMP]: Timestamp.now(),
    };
    await setDoc(doc(db, FIRESTORE_COLLECTIONS.EDITED_RECIPES, id), timestampedData);
};

const docCleanup = async () => {
    const now = Date.now();
    const collectionsToClean = [
        {
            name: FIRESTORE_COLLECTIONS.EDITED_RECIPES,
            retention: RETENTION_POLICY.RETENTION_PERIODS.RECIPES_EDITED,
        },
        {
            name: FIRESTORE_COLLECTIONS.JOB_STATUS,
            retention: RETENTION_POLICY.RETENTION_PERIODS.JOB_STATUS,
        },
    ];

    for (const collectionConfig of collectionsToClean) {
        const cutoffTime = Timestamp.fromMillis(
            now - collectionConfig.retention
        );
        const querySnapshot = await queryDocumentsByTime(
            collectionConfig.name,
            RETENTION_POLICY.TIMESTAMP_FIELD,
            "<",
            cutoffTime
        );

        const deletePromises: Promise<void>[] = [];

        querySnapshot.forEach((document) => {
            deletePromises.push(
                deleteDoc(doc(db, collectionConfig.name, document.id))
            );
        });

        await Promise.all(deletePromises);
        console.log(
            `Cleaned up ${deletePromises.length} documents from ${collectionConfig.name}`
        );
    }
};
export {
    db,
    queryDocumentById,
    getDocsByIds,
    getJobStatus,
    addRecipe,
    docCleanup,
    getRecipeManifestFromFirebase,
    getRecipeDataFromFirebase,
};
