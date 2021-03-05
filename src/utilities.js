import * as tmImage from '@teachablemachine/image';

let predictions = [];

export const models = [
  {
    name: "laptop",
    modelUrl: "https://teachablemachine.withgoogle.com/models/34tgAu-tp/",
  },
  {
    name: "external",
    modelUrl: "https://teachablemachine.withgoogle.com/models/aDUyx7SWA/",
  }
]

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

  return modelCache[modelName] = await loadModel(models.find(element => element.name === modelName).modelUrl);
}

export async function takeSnapshot(modelName, video) {
  const model = await getModel(modelName);
  const prediction = await model.predict(video);

  predictions.push(...prediction);
}

export function clearStackAndCalculateResult() {
  if (!predictions.length)
    return null;
  const result = {};
  predictions.forEach(({ className, probability }) => result[className] = (result[className] ?? 0) + probability);
  predictions = [];

  let maxProbability = 0;
  let maxClassName;
  Object.entries(result)
    .forEach(([className, probability]) => {
      if (probability > maxProbability) {
        maxProbability = probability;
        maxClassName = className;
      }
    });

  return maxClassName;
}
