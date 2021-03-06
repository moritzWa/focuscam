import * as tmImage from "@teachablemachine/image";

// Model Utilities

export const models = [
	{
		name: "laptop",
		modelUrl: "https://teachablemachine.withgoogle.com/models/W-3ihJl0y/",
	},
	{
		name: "external",
		modelUrl: "https://teachablemachine.withgoogle.com/models/QDbIsPWSP/",
	},
];

const modelCache = {};

async function loadModel(modelUrl) {
	const modelURL = modelUrl + "model.json";
	const metadataURL = modelUrl + "metadata.json";

	return await tmImage.load(modelURL, metadataURL);
}

async function getModel(modelName) {
	if (modelName in modelCache) {
		return modelCache[modelName];
	}

	return (modelCache[modelName] = await loadModel(
		models.find((element) => element.name === modelName).modelUrl
	));
}

// Prediction Utilities

let predictions = [];

export async function takeSnapshot(modelName, video) {
	const model = await getModel(modelName);
	const prediction = await model.predict(video);

	predictions.push(...prediction);
}

export function calculatePredsAverage() {
	if (!predictions.length) return null;

	// accumulate results
	const result = {};
	predictions.forEach(
		({ className, probability }) =>
			(result[className] = (result[className] ?? 0) + probability)
	);

	predictions = [];

	// temporarely turn of 'fingers' since the preds are off here
	result.fingers = 0;

	return result;
}

export function getMaxClassName(result) {
	let maxProbability = 0;
	let maxClassName;
	Object.entries(result).forEach(([className, probability]) => {
		if (probability > maxProbability) {
			maxProbability = probability;
			maxClassName = className;
		}
	});

	return maxClassName;
}

// UI Utilities
