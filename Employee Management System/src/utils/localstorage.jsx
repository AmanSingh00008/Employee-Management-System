const employees = [
    {
        "id": 1,
        "firstName": "Aman",
        "email": "employee1@me.com",
        "password": "123",
        "taskCount": {
            "active": 1,
            "newTask": 1,
            "completed": 1,
            "failed": 0
        },
        "tasks": [
            {
                "active": true,
                "newTask": false,
                "completed": false,
                "failed": false,
                "taskTitle": "Optimize Database Queries",
                "taskDescription": "Analyze query execution plans and add missing indexes to speed up the dashboard database queries.",
                "taskDate": "2026-07-04",
                "category": "Database"
            },
            {
                "active": false,
                "newTask": true,
                "completed": false,
                "failed": false,
                "taskTitle": "Design Responsive Layout",
                "taskDescription": "Ensure that the employee dashboard is mobile-ready and handles smaller screens beautifully.",
                "taskDate": "2026-07-05",
                "category": "Design"
            },
            {
                "active": false,
                "newTask": false,
                "completed": true,
                "failed": false,
                "taskTitle": "Setup Vite & Tailwind CSS",
                "taskDescription": "Bootstrap utility classes and configure Tailwind post-css plugins for styling.",
                "taskDate": "2026-07-02",
                "category": "Setup"
            }
        ]
    },
    {
        "id": 2,
        "firstName": "Babita",
        "email": "employee2@me.com",
        "password": "123",
        "taskCount": {
            "active": 1,
            "newTask": 1,
            "completed": 1,
            "failed": 1
        },
        "tasks": [
            {
                "active": true,
                "newTask": false,
                "completed": false,
                "failed": false,
                "taskTitle": "Security Penetration Review",
                "taskDescription": "Perform vulnerability assessment scan on authentication API endpoints.",
                "taskDate": "2026-07-04",
                "category": "Security"
            },
            {
                "active": false,
                "newTask": true,
                "completed": false,
                "failed": false,
                "taskTitle": "Draft User Guide",
                "taskDescription": "Write end-user documentation explaining how employees can request leaves or update tasks.",
                "taskDate": "2026-07-06",
                "category": "HR"
            },
            {
                "active": false,
                "newTask": false,
                "completed": true,
                "failed": false,
                "taskTitle": "Logo Refresh",
                "taskDescription": "Deliver transparent PNG file variations of the updated corporate emblem.",
                "taskDate": "2026-07-01",
                "category": "Marketing"
            },
            {
                "active": false,
                "newTask": false,
                "completed": false,
                "failed": true,
                "taskTitle": "Production Hotfix",
                "taskDescription": "Deploy critical patch for memory leak in socket connection pool.",
                "taskDate": "2026-07-03",
                "category": "DevOps"
            }
        ]
    },
    {
        "id": 3,
        "firstName": "Chaman",
        "email": "employee3@me.com",
        "password": "123",
        "taskCount": {
            "active": 2,
            "newTask": 0,
            "completed": 0,
            "failed": 0
        },
        "tasks": [
            {
                "active": true,
                "newTask": false,
                "completed": false,
                "failed": false,
                "taskTitle": "Customer Success Strategy",
                "taskDescription": "Align with key accounts to review Q3 software deployment roadblocks.",
                "taskDate": "2026-07-04",
                "category": "Management"
            },
            {
                "active": true,
                "newTask": false,
                "completed": false,
                "failed": false,
                "taskTitle": "Weekly Sprint Refinement",
                "taskDescription": "Facilitate backlog grooming session to prepare developers for incoming tickets.",
                "taskDate": "2026-07-04",
                "category": "Agile"
            }
        ]
    },
    {
        "id": 4,
        "firstName": "Deepak",
        "email": "employee4@me.com",
        "password": "123",
        "taskCount": {
            "active": 0,
            "newTask": 2,
            "completed": 0,
            "failed": 0
        },
        "tasks": [
            {
                "active": false,
                "newTask": true,
                "completed": false,
                "failed": false,
                "taskTitle": "Benchmark UI Components",
                "taskDescription": "Evaluate rendering latency across common dashboards on slow mobile connections.",
                "taskDate": "2026-07-05",
                "category": "Performance"
            },
            {
                "active": false,
                "newTask": true,
                "completed": false,
                "failed": false,
                "taskTitle": "Write Unit Tests",
                "taskDescription": "Achieve 80% code coverage on newly implemented auth hooks.",
                "taskDate": "2026-07-07",
                "category": "QA"
            }
        ]
    },
    {
        "id": 5,
        "firstName": "Ekta",
        "email": "employee5@me.com",
        "password": "123",
        "taskCount": {
            "active": 1,
            "newTask": 1,
            "completed": 2,
            "failed": 0
        },
        "tasks": [
            {
                "active": true,
                "newTask": false,
                "completed": false,
                "failed": false,
                "taskTitle": "Social Media Copy",
                "taskDescription": "Draft promotional updates for LinkedIn launching our new SaaS features.",
                "taskDate": "2026-07-04",
                "category": "Marketing"
            },
            {
                "active": false,
                "newTask": true,
                "completed": false,
                "failed": false,
                "taskTitle": "Newsletter Campaigns",
                "taskDescription": "Design template email newsletters targeted towards active users.",
                "taskDate": "2026-07-05",
                "category": "Marketing"
            },
            {
                "active": false,
                "newTask": false,
                "completed": true,
                "failed": false,
                "taskTitle": "Fix Navigation Bug",
                "taskDescription": "Address redirection loop observed on empty user profile configurations.",
                "taskDate": "2026-07-01",
                "category": "Bugfix"
            },
            {
                "active": false,
                "newTask": false,
                "completed": true,
                "failed": false,
                "taskTitle": "Translate User Portal",
                "taskDescription": "Provide French translations for key navigation and support strings.",
                "taskDate": "2026-07-03",
                "category": "I18n"
            }
        ]
    }
];

const admin = [
    {
        "id": 1,
        "email": "admin@me.com",
        "password": "123"
    }
];

export const setLocalStorage = () => {
    if (!localStorage.getItem('employees')) {
        localStorage.setItem('employees', JSON.stringify(employees));
    }
    if (!localStorage.getItem('admin')) {
        localStorage.setItem('admin', JSON.stringify(admin));
    }
};

export const getLocalStorage = () => {
    const employeesData = JSON.parse(localStorage.getItem('employees'));
    const adminData = JSON.parse(localStorage.getItem('admin'));

    return { employees: employeesData, admin: adminData };
};
