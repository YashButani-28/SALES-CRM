// backend/src/services/moduleService.js
import { APPLICATION_MODULES, MODULE_ACTIONS } from '../constants/modules.js';

export const listModules = async () => {
  return APPLICATION_MODULES;
};

export const getModuleActions = async () => {
  return MODULE_ACTIONS;
};