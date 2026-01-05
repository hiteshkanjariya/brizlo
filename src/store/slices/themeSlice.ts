import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'red';
export type ContainerType = 'full' | 'boxed';
export type SidebarType = 'full' | 'mini';
export type BorderRadius = 0 | 4 | 7 | 12;

interface ThemeState {
    mode: ThemeMode;
    color: ThemeColor;
    container: ContainerType;
    sidebar: SidebarType;
    borderRadius: BorderRadius;
}

const initialState: ThemeState = {
    mode: 'light',
    color: 'green',
    container: 'full',
    sidebar: 'full',
    borderRadius: 7,
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setMode: (state, action: PayloadAction<ThemeMode>) => {
            state.mode = action.payload;
        },
        setColor: (state, action: PayloadAction<ThemeColor>) => {
            state.color = action.payload;
        },
        setContainer: (state, action: PayloadAction<ContainerType>) => {
            state.container = action.payload;
        },
        setSidebar: (state, action: PayloadAction<SidebarType>) => {
            state.sidebar = action.payload;
        },
        setBorderRadius: (state, action: PayloadAction<BorderRadius>) => {
            state.borderRadius = action.payload;
        },
        resetToDefaults: () => initialState,
    },
});

export const {
    setMode,
    setColor,
    setContainer,
    setSidebar,
    setBorderRadius,
    resetToDefaults,
} = themeSlice.actions;

export default themeSlice.reducer;
