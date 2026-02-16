# FILE_STRUCTURE

frontend/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── .env.example
├── index.html
├── README.md
├── Documentation/
│   ├── SETUP_INSTRUCTIONS.md
│   ├── CODE_REFERENCE.md
│   └── FILE_STRUCTURE.md
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── vite-env.d.ts
    ├── lib/
    │   ├── api.ts
    │   ├── types.ts
    │   └── utils.ts
    ├── components/
    │   ├── layout/
    │   │   ├── SlideLayout.tsx
    │   │   ├── Topbar.tsx
    │   │   └── Sidebar.tsx
    │   └── ui/
    │       ├── Button.tsx
    │       ├── Card.tsx
    │       ├── Badge.tsx
    │       └── Input.tsx
    └── pages/
        ├── Dashboard.tsx
        ├── Collections.tsx
        ├── CollectionDetail.tsx
        ├── Jobs.tsx
        ├── Chat.tsx
        ├── DocumentDetail.tsx
        ├── Study.tsx
        └── Exports.tsx
