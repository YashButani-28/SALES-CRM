import { useDispatch, useSelector } from 'react-redux';
import { store } from '../app/store.js';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export const getState = () => store.getState();
