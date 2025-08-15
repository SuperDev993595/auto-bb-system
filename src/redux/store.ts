import { configureStore } from "@reduxjs/toolkit";
import appointmentsReducer from "./reducer/appointmentsReducer";
import tasksReducer from "./actions/tasks";
import customersReducer from "./actions/customers";
import servicesReducer from "./actions/services";
import remindersReducer from "./actions/reminders";
import inventoryReducer from "./actions/inventory";
import invoicesReducer from "./actions/invoices";
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
