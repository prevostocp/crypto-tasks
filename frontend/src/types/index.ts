export interface Task {
    title: string;
    description: string;
    completed: boolean | number | string;
}

export interface User {
    name: string;
    email: string;
    avatar: string;
}
