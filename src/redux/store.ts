import { configureStore } from "@reduxjs/toolkit";
import appointmentsReducer from "./reducer/appointmentsReducer";
import tasksReducer from "./reducer/tasksReducer";
import customersReducer from "./reducer/customersReducer";
import servicesReducer from "./reducer/servicesReducer";
import remindersReducer from "./reducer/remindersReducer";
import inventoryReducer from "./reducer/inventoryReducer";
import invoicesReducer from "./reducer/invoicesReducer";

const store = configureStore({
  reducer: {
    appointments: appointmentsReducer,
    tasks: tasksReducer,
    customers: customersReducer,
    services: servicesReducer,
    reminders: remindersReducer,
    inventory: inventoryReducer,
    invoices: invoicesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
