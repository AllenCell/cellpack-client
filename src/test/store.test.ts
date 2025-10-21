import { afterEach, describe, expect, it, vi } from "vitest";
import { useRecipeStore } from "../state/store";
import { EditableField, PackingInputs, ViewableRecipe } from "../types";

/* ---------- Test data ---------- */

export const editableFieldPeroxisomeRadius: EditableField = {
    id: "ef-peroxisome-radius",
    name: "Peroxisome radius",
    data_type: "number",
    input_type: "slider",
    description: "Radius of peroxisome (single_sphere)",
    default: 2.37,
    path: "objects.peroxisome.radius",
    min: 0.1,
    max: 10,
};

export const editableFieldPeroxisomeCount: EditableField = {
    id: "ef-peroxisome-count",
    name: "Peroxisome count",
    data_type: "number",
    input_type: "slider",
    description: "Number of peroxisomes inside the membrane",
    default: 121,
    path: "composition.membrane.regions.interior[2].count",
    min: 0,
    max: 1000,
};

export const packingInputsDictFixture: Record<string, PackingInputs> = {
    fooInput: {
        config: "config-123",
        recipe: "r1",
        editable_fields: [editableFieldPeroxisomeRadius, editableFieldPeroxisomeCount],
    },
    barInput: {
        config: "config-999",
        recipe: "r2",
        editable_fields: [],
    },
};

export const viewableRecipeR1: ViewableRecipe = {
    name: "Recipe R1",
    version: "1.0",
    format_version: "1.1.0",
    bounding_box: [
        [0, 0, 0],
        [100, 100, 100],
    ],
    objects: {
        nucleus: { name: "nucleus", type: "sphere", radius: 10 },
        peroxisome: {
            name: "peroxisome",
            packing_mode: "gradient",
            partners: { all_partners: [] },
            type: "single_sphere",
            gradient: "struct_gradient",
            radius: 2.37,
            jitter_attempts: 300,
            color: [0, 1, 0],
        },
        membrane_mesh: { name: "membrane_mesh", type: "mesh" },
    },
    composition: {
        comp1: { name: "base", count: 1, object: "nucleus" },
        membrane: {
            name: "membrane",
            count: 1,
            object: "membrane_mesh",
            regions: {
                interior: [
                    "nucleus",
                    "struct",
                    { count: 121, object: "peroxisome" },
                ],
            },
        },
    },
    gradients: {
        grad1: { name: "dna-gradient", description: "Test gradient" },
        struct_gradient: {
            name: "struct_gradient",
            description: "Structural gradient for peroxisome packing",
        },
    },
};

export const viewableRecipeR2: ViewableRecipe = {
    name: "Recipe R2",
    objects: { membrane: { name: "membrane", type: "sphere", radius: 50 } },
    composition: { comp1: { name: "base", count: 2, object: "membrane" } },
    gradients: {},
};

/* ---------- Mocks ---------- */

vi.mock("../utils/firebase", () => ({
    getPackingInputsDict: vi.fn(async () => packingInputsDictFixture),
}));

vi.mock("../utils/recipeLoader", () => ({
    getFirebaseRecipe: vi.fn(async (name: string) => {
        if (name === "r1") return viewableRecipeR1;
        if (name === "r2") return viewableRecipeR2;
        return { name };
    }),
    jsonToString: (obj: unknown) => JSON.stringify(obj, null, 2),
}));

const getPackingInputsDict =
    (await import("../utils/firebase")).getPackingInputsDict as unknown as ReturnType<typeof vi.fn>;
const getFirebaseRecipe =
    (await import("../utils/recipeLoader")).getFirebaseRecipe as unknown as ReturnType<typeof vi.fn>;

/* ---------- Tests ---------- */

describe("recipe store", () => {
    afterEach(() => {
        useRecipeStore.getState().reset();
        vi.clearAllMocks();
    });

    describe("input options loading", () => {
        it("loads input options", async () => {
            const loadInputOptions = useRecipeStore.getState().loadInputOptions;
            await loadInputOptions();
            const inputOptions = useRecipeStore.getState().inputOptions;

            expect(getPackingInputsDict).toHaveBeenCalledTimes(1);
            expect(inputOptions.fooInput.recipe).toBe("r1");
            expect(inputOptions.fooInput.editable_fields?.[0]?.path).toBe(
                "objects.peroxisome.radius"
            );
        });
    });

    describe("recipe loading and selection", () => {
        it("loads a recipe once and sets mirrors", async () => {
            const { loadRecipe } = useRecipeStore.getState();

            await loadRecipe("r1");
            const r1 = useRecipeStore.getState().recipes["r1"];

            expect(getFirebaseRecipe).toHaveBeenCalledWith("r1");
            expect(r1.currentObj.objects?.nucleus?.radius).toBe(10);
            expect(r1.currentObj.composition?.comp1?.object).toBe("nucleus");
            expect(r1.isModified).toBe(false);

            await loadRecipe("r1");
            expect(getFirebaseRecipe).toHaveBeenCalledTimes(1);
        });

        it("selects an input and auto-loads missing recipe", async () => {
            const { loadInputOptions, selectInput } = useRecipeStore.getState();

            await loadInputOptions();
            await selectInput("fooInput");

            const state = useRecipeStore.getState();
            expect(state.selectedInputName).toBe("fooInput");
            expect(state.selectedRecipeId).toBe("r1");
            expect(state.recipes["r1"]).toBeDefined();
        });
    });

    describe("mutations", () => {
        it("updateRecipeObj applies changes and marks modified", async () => {
            const { loadRecipe, updateRecipeObj } = useRecipeStore.getState();
            await loadRecipe("r1");

            updateRecipeObj("r1", {
                "objects.nucleus.radius": 42,
                "composition.comp1.name": "base-updated",
            });
            const r1 = useRecipeStore.getState().recipes["r1"];

            expect(r1.currentObj.objects?.nucleus?.radius).toBe(42);
            expect(r1.currentObj.composition?.comp1?.name).toBe("base-updated");
            expect(r1.isModified).toBe(true);
        });

        it("restoreRecipeDefault resets to original and clears modified", async () => {
            const { loadRecipe, updateRecipeObj, restoreRecipeDefault } =
                useRecipeStore.getState();
            await loadRecipe("r1");

            updateRecipeObj("r1", { "objects.nucleus.radius": 99 });
            expect(useRecipeStore.getState().recipes["r1"].isModified).toBe(true);

            restoreRecipeDefault("r1");
            const r1 = useRecipeStore.getState().recipes["r1"];

            expect(r1.currentObj.objects?.nucleus?.radius).toBe(10);
            expect(r1.isModified).toBe(false);
        });
    });

    describe("getters", () => {
        it("getCurrentValue / getOriginalValue read from selected recipe", async () => {
            const {
                loadInputOptions,
                selectInput,
                loadRecipe,
                getCurrentValue,
                getOriginalValue,
            } = useRecipeStore.getState();

            await loadInputOptions();
            await selectInput("fooInput");
            await loadRecipe("r1");

            useRecipeStore.getState().updateRecipeObj("r1", {
                "objects.nucleus.radius": 5,
            });

            expect(getCurrentValue("objects.nucleus.radius")).toBe(5);
            expect(getOriginalValue("objects.nucleus.radius")).toBe(10);
            expect(getCurrentValue("missing.path")).toBeUndefined();
        });

        it("supports peroxisome radius and count paths", async () => {
            const {
                loadInputOptions,
                selectInput,
                loadRecipe,
                getCurrentValue,
                updateRecipeObj,
            } = useRecipeStore.getState();

            await loadInputOptions();
            await selectInput("fooInput");
            await loadRecipe("r1");

            expect(getCurrentValue("objects.peroxisome.radius")).toBe(2.37);
            expect(
                getCurrentValue("composition.membrane.regions.interior[2].count")
            ).toBe(121);

            updateRecipeObj("r1", {
                "objects.peroxisome.radius": 3.1,
                "composition.membrane.regions.interior[2].count": 150,
            });

            expect(getCurrentValue("objects.peroxisome.radius")).toBe(3.1);
            expect(
                getCurrentValue("composition.membrane.regions.interior[2].count")
            ).toBe(150);
        });
    });

    describe("packing serialization", () => {
        it("startPacking serializes currentObj and passes ids", async () => {
            const {
                loadInputOptions,
                selectInput,
                loadRecipe,
                startPacking,
            } = useRecipeStore.getState();

            await loadInputOptions();
            await selectInput("fooInput");
            await loadRecipe("r1");

            const spy = vi.fn(async () => { });
            await startPacking(spy);

            expect(spy).toHaveBeenCalledWith(
                "r1",
                "config-123",
                expect.any(String)
            );

            const [, , recipeString] = spy.mock.calls[0] as unknown as [string, string, string];
            const parsed = JSON.parse(recipeString);
            expect(parsed.objects.peroxisome.radius).toBe(2.37);
            expect(
                parsed.composition.membrane.regions.interior[2].count
            ).toBe(121);
        });
    });
});
