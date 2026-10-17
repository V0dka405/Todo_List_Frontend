# 🎨 Todoplan — Frontend Web Application

> หน้าเว็บแอปพลิเคชัน Todo List สไตล์โมเดิร์น Dark Forest พัฒนาด้วย **Vue 3** (Composition API, `<script setup>`) ร่วมกับ **TypeScript**, **Tailwind CSS 4** และ **Vite 8** เชื่อมต่อกับ RESTful API Server ([Todo_List_Backend](https://github.com/V0dka405/Todo_List_Backend))

---

## 🌟 จุดเด่นและฟังก์ชันการใช้งาน (Key Features)

- **การจัดการ Todo ครบวงจร**:
  - เพิ่มรายการงานใหม่ (กด Enter หรือคลิกปุ่ม "+ New task")
  - ทำเครื่องหมายเสร็จสิ้น / ยกเลิกเครื่องหมาย พร้อมแอนิเมชันฉลองความสำเร็จ (Confetti Effect)
  - ดับเบิลคลิกหรือกดไอคอนดินสอเพื่อแก้ไขชื่อรายการได้ทันที (Inline Edit รองรับปุ่ม Enter และ Esc)
  - ลบรายการเดี่ยว และปุ่มล้างงานที่เสร็จแล้วทั้งหมด
- **มุมมองที่หลากหลาย (View Modes)**:
  - **List View**: รายการงานแบบกระชับ อ่านง่าย พร้อมแถบสถานะ
  - **Kanban Board**: บอร์ดจัดการงานแบ่ง 3 คอลัมน์ (To Do, In Progress, Done) เลื่อนดูได้อย่างลื่นไหล
- **ระบบค้นหาและกรองข้อมูล**: กรองตามสถานะ (ทั้งหมด, ยังไม่เสร็จ, เสร็จแล้ว) พร้อมช่อง Search ค้นหาตามตัวอักษรแบบ Real-time
- **Optimistic UI Updates**: หน้าจออัปเดตสถานะทันทีเมื่อกด เพื่อความรู้สึกลื่นไหลสูงสุด และมีระบบ Rollback ย้อนคืนสถานะเดิมพร้อมแจ้งเตือนภาษาไทยหาก API ล้มเหลว
- **Mobile-First & iOS Safari Ergonomics**:
  - ขนาดตัวหนังสือ Input เป็น `16px` เพื่อป้องกันไม่ให้ Safari บน iPhone ซูมหน้าจอขณะพิมพ์
  - ขยายปุ่ม Action ให้มีพื้นที่แตะกว้างขึ้น (`size-8.5` / 34px) กดง่ายด้วยนิ้วโป้ง
  - เว้นระยะ Safe Area ด้านล่างหน้าจอ (`env(safe-area-inset-bottom)`) ไม่ให้ปุ่มทับกับ Home Indicator ของ iPhone
  - ตั้งค่า Vite Proxy เชื่อมต่อ API ผ่าน relative path `/api` ป้องกันปัญหา CORS และ Mixed Content ในทุกเครือข่าย

---

## 🛠 Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (`^3.5.42`) — Composition API + `<script setup>`
- **Language**: [TypeScript](https://www.typescriptlang.org/) (`~6.0.2`) — ตรวจสอบประเภทข้อมูลด้วย `vue-tsc`
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (`^4.3.3`) — Engine รุ่นใหม่ (Rust/Lightning CSS) ดีไซน์ Dark Forest Theme (`#0c1510`)
- **Build Tool**: [Vite 8](https://vite.dev/) (`^8.3.0`) — Hot Module Replacement (HMR) รวดเร็วระดับเสี้ยววินาที
- **Web Server (Docker)**: Nginx Alpine เสิร์ฟไฟล์ Static Production
- **Lightweight Design**: ใช้ Pure SVG และสร้าง Canvas Confetti ด้วย Vanilla JS ไม่พึ่งพา Library ภายนอกที่ไม่จำเป็น ทำให้ไฟล์ Production Bundle มีขนาดเล็กมาก (JS แค่ ~103KB)

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
todo-frontend/
├── src/
│   ├── api/
│   │   ├── client.ts             # Fetch Wrapper จัดการ Network Requests และ Error
│   │   └── todos.ts              # ฟังก์ชันเรียก RESTful API CRUD ของ Todo
│   ├── components/
│   │   ├── KanbanBoard.vue       # มุมมอง Kanban Board 3 คอลัมน์
│   │   ├── TodoFilter.vue        # แถบแคปซูลกรองสถานะ (All, Active, Completed)
│   │   ├── TodoForm.vue          # โมดอลและปุ่มสำหรับเพิ่มรายการ Todo
│   │   ├── TodoItem.vue          # การแสดงผลแถว Todo แต่ละรายการ (Inline Edit, Checkbox)
│   │   └── ViewSwitcher.vue      # ปุ่มสลับมุมมอง List View / Kanban Board
│   ├── composables/
│   │   ├── useTheme.ts           # จัดการ State มุมมองการแสดงผล
│   │   └── useTodos.ts           # State Management หลักของ Todo (CRUD, Filter, Search, Optimistic Update)
│   ├── types/
│   │   └── todo.ts               # TypeScript Interfaces (Todo, FilterType, Category)
│   ├── utils/
│   │   ├── confetti.ts           # Pure Canvas Confetti Particle System
│   │   └── todoParser.ts         # แยกแยะหมวดหมู่งานและแท็ก
│   ├── App.vue                   # หน้าหลักของแอปพลิเคชัน
│   ├── main.ts                   # จุดเริ่มต้นการ Mount Vue App
│   └── style.css                 # สไตล์หลักและ Tailwind Directives
├── Dockerfile                    # Multi-stage Build + Nginx Static Server
├── nginx.conf                    # การตั้งค่า Nginx (Cache Assets, Clean URL Routing)
├── docker-compose.yml            # รันเฉพาะเว็บ Frontend บน Docker
├── package.json
├── tsconfig.json
├── vite.config.ts                # ตั้งค่า Vite, Tailwind Plugin และ API Proxy
└── README.md                     # คู่มือนี้
```

---

## 🚀 วิธีการเริ่มต้นใช้งาน (Getting Started)

### ข้อกำหนดเบื้องต้น:
ต้องมี RESTful API Server ทำงานอยู่ก่อน (ดูที่คู่มือของ [Todo_List_Backend](https://github.com/V0dka405/Todo_List_Backend))

---

### วิธีที่ 1: รันด้วย Docker Compose (แนะนำ)

สั่ง build และรัน Container ด้วย Nginx:

```bash
docker compose up -d --build
```

- เปิดเว็บที่: [http://localhost:8080](http://localhost:8080)
- ปิด Container: `docker compose down`

---

### วิธีที่ 2: รันในเครื่อง (Local Development)

#### 1. ติดตั้ง Dependencies
```bash
npm install
```

#### 2. ตั้งค่า Environment Variables
คัดลอกไฟล์ `.env.example` เป็น `.env`:
```bash
cp .env.example .env
```
*(ค่าเริ่มต้นตั้งไว้เชื่อมต่อกับ API ที่ `http://localhost:3333/api` เรียบร้อยแล้ว)*

#### 3. สั่งรัน Dev Server
```bash
npm run dev
```

เปิดดูหน้าเว็บได้ที่: [http://localhost:5173](http://localhost:5173)

---

## 🛠 Scripts คำสั่งทั้งหมด

| คำสั่ง | หน้าที่การทำงาน |
| :--- | :--- |
| `npm run dev` | เปิด Local Development Server พร้อมระบบ Hot Module Replacement |
| `npm run build` | ตรวจสอบ Type ด้วย `vue-tsc` และ Compile เป็น Production Bundle ไปที่โฟลเดอร์ `dist/` |
| `npm run preview` | เปิดดูผลลัพธ์ของไฟล์ Build ก่อนนำไป Deploy จริง |

---

## 🔗 Repository ที่เกี่ยวข้อง
- **Backend API Server**: [https://github.com/V0dka405/Todo_List_Backend](https://github.com/V0dka405/Todo_List_Backend)
