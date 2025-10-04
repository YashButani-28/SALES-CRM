import { listModules, getModuleActions } from '../services/moduleService.js';

export const listModulesController = (req, res) => {
  return res.json({ modules: listModules(), actions: getModuleActions() });
};
