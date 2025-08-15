import { configureStore } from "@reduxjs/toolkit";
import appointmentsReducer from "./reducer/appointmentsReducer";
import tasksReducer from "./reducer/tasksReducer";
import customersReducer from "./reducer/customersReducer";
import servicesReducer from "./reducer/servicesReducer";
import remindersReducer from "./reducer/remindersReducer";
import inventoryReducer from "./reducer/inventoryReducer";
import invoicesReducer from "./reducer/invoicesReducer";
import dashboardReducer from "./actions/dashboard";
import adminReducer from "./actions/admin";
import emailReducer from "./actions/email";

const store = configureStore({
  reducer: {
    appointments: appointmentsReducer,
    tasks: tasksReducer,
    customers: customersReducer,
    services: servicesReducer,
    reminders: remindersReducer,
    inventory: inventoryReducer,
    invoices: invoicesReducer,
    dashboard: dashboardReducer,
    admin: adminReducer,
    email: emailReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
