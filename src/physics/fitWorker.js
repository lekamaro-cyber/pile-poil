// Calcul du tir au doigt en arrière-plan (Web Worker) : l'image ne se fige pas pendant le calcul, le tireur prend
// son élan en même temps. Le résultat est le même qu'en direct (même module, même physique).
import { fitShot, makeView } from './trajectoryFit.js';

self.onmessage = (e) => {
  const { id, start, path, view, goalX } = e.data;
  try {
    const { project, ray } = makeView(view);
    self.postMessage({ id, result: fitShot({ start, path, project, ray, goalX }) });
  } catch (err) {
    self.postMessage({ id, error: String(err && err.message ? err.message : err) });
  }
};
