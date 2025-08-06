import TaskTable from "../components/Tasks/TaskTable";
import PageTitle from "../components/Shared/PageTitle";

export default function TasksPage() {
    return (
        <div className="p-6">
            <PageTitle title="Task Management" />
            <TaskTable />
        </div>
    );
}
