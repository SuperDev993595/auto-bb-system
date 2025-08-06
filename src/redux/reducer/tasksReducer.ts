import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Task = {
    id: string;
    business: string;
    contact: string;
    phone: string;
    followUp: string;
    outcome: string;
    proposalSent: boolean;
    notInterested: boolean;
};

type TasksState = {
    data: Task[];
};

const initialState: TasksState = {
    data: [],
};

const tasksSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        addTask: (state, action: PayloadAction<Task>) => {
            state.data.push(action.payload);
        },
        removeTask: (state, action: PayloadAction<string>) => {
            state.data = state.data.filter(task => task.id !== action.payload);
        },
        updateTask: (state, action: PayloadAction<Task>) => {
            const index = state.data.findIndex(task => task.id === action.payload.id);
            if (index !== -1) {
                state.data[index] = action.payload;
            }
        },
    },
});

export const {
    addTask,
    removeTask,
    updateTask,
} = tasksSlice.actions;

export default tasksSlice.reducer;
