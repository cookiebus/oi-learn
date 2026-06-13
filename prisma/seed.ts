import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 开始种子数据...")

  // 创建管理员
  const adminPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@shencode.cn" },
    update: {},
    create: {
      name: "管理员",
      email: "admin@shencode.cn",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  })
  console.log(`✅ 管理员: ${admin.email} / admin123`)

  // 创建示例学生
  const studentPassword = await bcrypt.hash("123456", 10)
  const student = await prisma.user.upsert({
    where: { email: "student@test.com" },
    update: {},
    create: {
      name: "测试学生",
      email: "student@test.com",
      passwordHash: studentPassword,
      role: "STUDENT",
    },
  })
  console.log(`✅ 测试学生: ${student.email} / 123456`)

  // === 创建知识点体系（信奥 C++ 入门） ===

  // 1. 基础语法
  const p1 = await prisma.knowledgePoint.upsert({
    where: { slug: "hello-world" },
    update: {},
    create: {
      title: "Hello World",
      slug: "hello-world",
      description: "编写你的第一个 C++ 程序，了解程序的基本结构。",
      content: `## 第一个 C++ 程序\n\nC++ 程序的基本结构：\n\n\`\`\`cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n\`\`\`\n\n- \`#include <iostream>\`：输入输出流库\n- \`using namespace std;\`：使用标准命名空间\n- \`int main()\`：主函数，程序入口\n- \`cout <<\`：输出语句\n- \`return 0;\`：返回 0 表示程序正常结束`,
      difficulty: 1,
      estimatedMin: 15,
      category: "语法基础",
      isPublished: true,
      orderIndex: 1,
    },
  })

  const p2 = await prisma.knowledgePoint.upsert({
    where: { slug: "variables-data-types" },
    update: {},
    create: {
      title: "变量与数据类型",
      slug: "variables-data-types",
      description: "学习 C++ 中的变量定义和基本数据类型。",
      content: `## 变量与数据类型\n\n### 基本数据类型\n- \`int\`：整数\n- \`long long\`：长整数（信奥常用）\n- \`float\` / \`double\`：浮点数\n- \`char\`：字符\n- \`bool\`：布尔值\n\n### 变量定义\n\`\`\`cpp\nint a = 10;\nlong long b = 10000000000LL;\ndouble c = 3.14;\nchar d = 'A';\nbool e = true;\n\`\`\``,
      difficulty: 1,
      estimatedMin: 20,
      category: "语法基础",
      isPublished: true,
      orderIndex: 2,
    },
  })

  const p3 = await prisma.knowledgePoint.upsert({
    where: { slug: "input-output" },
    update: {},
    create: {
      title: "输入与输出",
      slug: "input-output",
      description: "学习 C++ 的标准输入输出，以及格式化输出。",
      content: `## 输入与输出\n\n### 标准输入\n\`\`\`cpp\nint a;\ncin >> a;\n\`\`\`\n\n### 标准输出\n\`\`\`cpp\ncout << "a = " << a << endl;\n\`\`\`\n\n### scanf / printf（信奥常用）\n\`\`\`cpp\nint a;\nscanf("%d", &a);\nprintf("%d\\n", a);\n\`\`\``,
      difficulty: 1,
      estimatedMin: 15,
      category: "语法基础",
      isPublished: true,
      orderIndex: 3,
    },
  })

  const p4 = await prisma.knowledgePoint.upsert({
    where: { slug: "if-else" },
    update: {},
    create: {
      title: "条件分支 if-else",
      slug: "if-else",
      description: "学习使用 if-else 进行条件判断。",
      content: `## 条件分支\n\n\`\`\`cpp\nif (条件) {\n    // 条件成立\n} else if (其他条件) {\n    // 其他条件成立\n} else {\n    // 以上都不成立\n}\n\`\`\`\n\n### 比较运算符\n- \`==\`, \`!=\`, \`<\`, \`>\`, \`<=\`, \`>=\`\n\n### 逻辑运算符\n- \`&&\` (与), \`||\` (或), \`!\` (非)`,
      difficulty: 1,
      estimatedMin: 20,
      category: "语法基础",
      isPublished: true,
      orderIndex: 4,
    },
  })

  const p5 = await prisma.knowledgePoint.upsert({
    where: { slug: "for-loop" },
    update: {},
    create: {
      title: "for 循环",
      slug: "for-loop",
      description: "学习使用 for 循环进行重复操作。",
      content: `## for 循环\n\n\`\`\`cpp\nfor (初始化; 条件; 更新) {\n    // 循环体\n}\n\`\`\`\n\n### 示例：输出 1 到 100\n\`\`\`cpp\nfor (int i = 1; i <= 100; i++) {\n    cout << i << endl;\n}\n\`\`\`\n\n### 嵌套循环\n\`\`\`cpp\nfor (int i = 1; i <= n; i++) {\n    for (int j = 1; j <= m; j++) {\n        cout << i * j << " ";\n    }\n    cout << endl;\n}\n\`\`\``,
      difficulty: 2,
      estimatedMin: 25,
      category: "语法基础",
      isPublished: true,
      orderIndex: 5,
    },
  })

  const p6 = await prisma.knowledgePoint.upsert({
    where: { slug: "while-loop" },
    update: {},
    create: {
      title: "while 循环",
      slug: "while-loop",
      description: "学习 while 和 do-while 循环的使用。",
      content: `## while 循环\n\n\`\`\`cpp\nwhile (条件) {\n    // 循环体\n}\n\`\`\`\n\n### do-while 循环\n\`\`\`cpp\ndo {\n    // 至少执行一次\n} while (条件);\n\`\`\``,
      difficulty: 2,
      estimatedMin: 20,
      category: "语法基础",
      isPublished: true,
      orderIndex: 6,
    },
  })

  const p7 = await prisma.knowledgePoint.upsert({
    where: { slug: "array-1d" },
    update: {},
    create: {
      title: "一维数组",
      slug: "array-1d",
      description: "学习一维数组的定义和使用。",
      content: `## 一维数组\n\n\`\`\`cpp\nint a[100];  // 定义长度为 100 的数组\n\`\`\`\n\n### 数组操作\n\`\`\`cpp\n// 输入\nfor (int i = 0; i < n; i++) {\n    cin >> a[i];\n}\n\n// 查找最大值\nint maxVal = a[0];\nfor (int i = 1; i < n; i++) {\n    if (a[i] > maxVal) maxVal = a[i];\n}\n\`\`\`\n\n注意：数组下标从 0 开始！`,
      difficulty: 2,
      estimatedMin: 25,
      category: "数据结构",
      isPublished: true,
      orderIndex: 7,
    },
  })

  const p8 = await prisma.knowledgePoint.upsert({
    where: { slug: "string" },
    update: {},
    create: {
      title: "字符串",
      slug: "string",
      description: "学习 C++ 字符串的使用（string 类型和字符数组）。",
      content: `## 字符串\n\n### string 类型（推荐）\n\`\`\`cpp\n#include <string>\nstring s;\ncin >> s;          // 读入（不含空格）\ngetline(cin, s);   // 读入一行\ns.length();        // 长度\ns[i];              // 访问字符\ns.substr(pos, len); // 子串\n\`\`\``,
      difficulty: 2,
      estimatedMin: 20,
      category: "数据结构",
      isPublished: true,
      orderIndex: 8,
    },
  })

  const p9 = await prisma.knowledgePoint.upsert({
    where: { slug: "function" },
    update: {},
    create: {
      title: "函数",
      slug: "function",
      description: "学习函数的定义、参数传递和返回值。",
      content: `## 函数\n\n\`\`\`cpp\n// 函数定义\nint add(int a, int b) {\n    return a + b;\n}\n\n// 函数调用\nint result = add(3, 5);\n\`\`\`\n\n### 重要概念\n- 函数的声明和定义\n- 形参和实参\n- 值传递和引用传递\n- 函数重载`,
      difficulty: 3,
      estimatedMin: 30,
      category: "语法基础",
      isPublished: true,
      orderIndex: 9,
    },
  })

  const p10 = await prisma.knowledgePoint.upsert({
    where: { slug: "array-2d" },
    update: {},
    create: {
      title: "二维数组",
      slug: "array-2d",
      description: "学习二维数组的定义、遍历和基本应用。",
      content: `## 二维数组\n\n\`\`\`cpp\nint a[100][100];  // 100x100 的二维数组\n\`\`\`\n\n### 双重循环遍历\n\`\`\`cpp\nfor (int i = 0; i < n; i++) {\n    for (int j = 0; j < m; j++) {\n        cin >> a[i][j];\n    }\n}\n\`\`\``,
      difficulty: 3,
      estimatedMin: 25,
      category: "数据结构",
      isPublished: true,
      orderIndex: 10,
    },
  })

  console.log("✅ 知识点创建完成")

  // === 设置前置依赖 ===
  const dependencies = [
    { point: p2.slug, prereq: p1.slug },   // 变量 <- Hello World
    { point: p3.slug, prereq: p1.slug },   // IO <- Hello World
    { point: p3.slug, prereq: p2.slug },   // IO <- 变量
    { point: p4.slug, prereq: p2.slug },   // if <- 变量
    { point: p4.slug, prereq: p3.slug },   // if <- IO
    { point: p5.slug, prereq: p4.slug },   // for <- if
    { point: p6.slug, prereq: p4.slug },   // while <- if
    { point: p7.slug, prereq: p5.slug },   // 一维数组 <- for
    { point: p8.slug, prereq: p5.slug },   // string <- for
    { point: p9.slug, prereq: p5.slug },   // 函数 <- for
    { point: p10.slug, prereq: p7.slug },  // 二维数组 <- 一维数组
    { point: p10.slug, prereq: p5.slug },  // 二维数组 <- for（嵌套循环）
  ]

  for (const dep of dependencies) {
    const point = await prisma.knowledgePoint.findUnique({ where: { slug: dep.point } })
    const prereq = await prisma.knowledgePoint.findUnique({ where: { slug: dep.prereq } })
    if (point && prereq) {
      await prisma.prerequisite.upsert({
        where: { pointId_prerequisiteId: { pointId: point.id, prerequisiteId: prereq.id } },
        update: {},
        create: { pointId: point.id, prerequisiteId: prereq.id },
      })
    }
  }
  console.log("✅ 前置依赖设置完成")

  // === 创建测试题 ===
  // p1: Hello World
  await prisma.question.createMany({
    data: [
      {
        pointId: p1.id,
        type: "CHOICE",
        question: "C++ 程序的入口函数是什么？",
        options: JSON.stringify([
          { label: "A", text: "main()" },
          { label: "B", text: "start()" },
          { label: "C", text: "begin()" },
          { label: "D", text: "run()" },
        ]),
        correctAnswer: "A",
        explanation: "C++ 程序从 main() 函数开始执行。",
        orderIndex: 1,
      },
      {
        pointId: p1.id,
        type: "CHOICE",
        question: "以下哪个头文件用于输入输出操作？",
        options: JSON.stringify([
          { label: "A", text: "#include <cmath>" },
          { label: "B", text: "#include <string>" },
          { label: "C", text: "#include <iostream>" },
          { label: "D", text: "#include <algorithm>" },
        ]),
        correctAnswer: "C",
        explanation: "iostream 是输入输出流库，包含 cin、cout 等。",
        orderIndex: 2,
      },
      {
        pointId: p1.id,
        type: "CHOICE",
        question: "cout << \"Hello\"; 这行代码的作用是？",
        options: JSON.stringify([
          { label: "A", text: "从键盘读入 Hello" },
          { label: "B", text: "输出 Hello 到屏幕" },
          { label: "C", text: "定义一个变量 Hello" },
          { label: "D", text: "包含头文件" },
        ]),
        correctAnswer: "B",
        explanation: "cout << 用于输出内容到控制台。",
        orderIndex: 3,
      },
    ],
  })

  // p4: if-else
  await prisma.question.createMany({
    data: [
      {
        pointId: p4.id,
        type: "CHOICE",
        question: "int a = 5, b = 10; if (a > b) cout << a; else cout << b; 输出什么？",
        options: JSON.stringify([
          { label: "A", text: "5" },
          { label: "B", text: "10" },
          { label: "C", text: "510" },
          { label: "D", text: "编译错误" },
        ]),
        correctAnswer: "B",
        explanation: "5 > 10 不成立，所以执行 else 分支，输出 b 的值 10。",
        orderIndex: 1,
      },
      {
        pointId: p4.id,
        type: "CHOICE",
        question: '以下哪个是逻辑"与"运算符？',
        options: JSON.stringify([
          { label: "A", text: "||" },
          { label: "B", text: "&&" },
          { label: "C", text: "!" },
          { label: "D", text: "&" },
        ]),
        correctAnswer: "B",
        explanation: "&& 表示逻辑与（AND），|| 表示逻辑或（OR），! 表示逻辑非（NOT）。",
        orderIndex: 2,
      },
      {
        pointId: p4.id,
        type: "CHOICE",
        question: "判断一个数 x 是否为偶数的正确条件是？",
        options: JSON.stringify([
          { label: "A", text: "x % 2 == 0" },
          { label: "B", text: "x / 2 == 0" },
          { label: "C", text: "x % 2 == 1" },
          { label: "D", text: "x % 2 != 0" },
        ]),
        correctAnswer: "A",
        explanation: "一个数能被 2 整除（余数为 0）即为偶数。x % 2 == 0 表示 x 除以 2 的余数为 0。",
        orderIndex: 3,
      },
    ],
  })

  // p5: for loop
  await prisma.question.createMany({
    data: [
      {
        pointId: p5.id,
        type: "CHOICE",
        question: "for (int i = 1; i <= 5; i++) 这个循环会执行几次？",
        options: JSON.stringify([
          { label: "A", text: "4 次" },
          { label: "B", text: "5 次" },
          { label: "C", text: "6 次" },
          { label: "D", text: "无限循环" },
        ]),
        correctAnswer: "B",
        explanation: "i 从 1 到 5，共执行 5 次循环体。",
        orderIndex: 1,
      },
      {
        pointId: p5.id,
        type: "CHOICE",
        question: "以下代码段会输出什么？\nint sum = 0;\nfor (int i = 1; i <= 100; i++) {\n    sum += i;\n}\ncout << sum;",
        options: JSON.stringify([
          { label: "A", text: "100" },
          { label: "B", text: "5050" },
          { label: "C", text: "4950" },
          { label: "D", text: "5000" },
        ]),
        correctAnswer: "B",
        explanation: "这是计算 1+2+...+100，结果为 5050。",
        orderIndex: 2,
      },
      {
        pointId: p5.id,
        type: "CHOICE",
        question: "以下哪个循环不会无限执行？",
        options: JSON.stringify([
          { label: "A", text: "for (int i = 0; i < 10; i--)" },
          { label: "B", text: "while (1)" },
          { label: "C", text: "for (int i = 0; i < 10; i++)" },
          { label: "D", text: "for (;;)" },
        ]),
        correctAnswer: "C",
        explanation: "A 的 i 在减小永远不到 10，B 和 D 是无限循环。C 是标准循环。",
        orderIndex: 3,
      },
    ],
  })

  // p7: 一维数组
  await prisma.question.createMany({
    data: [
      {
        pointId: p7.id,
        type: "CHOICE",
        question: "int a[5] = {10, 20, 30, 40, 50}; cout << a[2]; 输出什么？",
        options: JSON.stringify([
          { label: "A", text: "20" },
          { label: "B", text: "30" },
          { label: "C", text: "40" },
          { label: "D", text: "50" },
        ]),
        correctAnswer: "B",
        explanation: "数组下标从 0 开始，a[2] 是第三个元素 30。",
        orderIndex: 1,
      },
      {
        pointId: p7.id,
        type: "CHOICE",
        question: "定义数组 int a[100]; 时，合法的下标范围是？",
        options: JSON.stringify([
          { label: "A", text: "1 到 100" },
          { label: "B", text: "0 到 99" },
          { label: "C", text: "0 到 100" },
          { label: "D", text: "1 到 99" },
        ]),
        correctAnswer: "B",
        explanation: "C++ 数组下标从 0 开始到 N-1，所以 a[100] 的范围是 0~99。",
        orderIndex: 2,
      },
      {
        pointId: p7.id,
        type: "CHOICE",
        question: "遍历数组通常使用什么结构？",
        options: JSON.stringify([
          { label: "A", text: "if-else 语句" },
          { label: "B", text: "for 循环" },
          { label: "C", text: "switch 语句" },
          { label: "D", text: "函数定义" },
        ]),
        correctAnswer: "B",
        explanation: "数组遍历通常使用 for 循环配合下标。",
        orderIndex: 3,
      },
    ],
  })

  console.log("✅ 题目创建完成")

  // === 设置学生初始进度 ===
  // 第一个知识点自动解锁
  await prisma.studentProgress.upsert({
    where: { userId_pointId: { userId: student.id, pointId: p1.id } },
    update: {},
    create: {
      userId: student.id,
      pointId: p1.id,
      status: "UNLOCKED",
    },
  })

  console.log("✅ 学生初始进度设置完成")
  console.log("🎉 种子数据全部完成！")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
