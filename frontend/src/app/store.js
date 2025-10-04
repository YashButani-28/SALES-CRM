import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/auth/authSlice.js';
import permissionsReducer from '../features/permissions/permissionsSlice.js';
import rolesReducer from '../features/roles/rolesSlice.js';
import usersReducer from '../features/users/usersSlice.js';
import modulesReducer from '../features/modules/modulesSlice.js';

const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'permissions', 'roles', 'users', 'modules'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  permissions: permissionsReducer,
  roles: rolesReducer,
  users: usersReducer,
  modules: modulesReducer,
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export const getAuthToken = (state) => state.auth.token;
