import { DB } from "@/app/libs/DB";
import { NextResponse } from "next/server";
// import token ด้วยตัวเองตรงนี้
import jwt from "jsonwebtoken";

//POST /api/user/login
export const POST = async (request) => {
  const body = await request.json();
  // แกะ username กับ password มา
  const { username, password } = body;

  // ควรจะเช็ค varidate แต่ข้ามไปทำบ่อยละ

  // ค้นหาว่ามี user ที่มี userpasswprd ตามนี้หรือเปล่า
  const user = DB.users.find(
    (user) => user.username === username && user.password === password
  );
  // ดักกรณี หา user ไม่เจอ
  if (!user)
    return NextResponse.json(
      {
        ok: false,
        message: "Username or password is incorrect",
      },
      { status: 400 }
    );
  // สมมุติว่า เช็คแล้วเจอ user จริงๆ -> สร้าง token ขึ้นมาเลย
  const token = jwt.sign(
    // มันจะรับ paramitter 3 ตัว
    // 1.payload -> data ที่อยากจะฝังเข้าไปใน token
    {
      username,
      role: user.role,
      studentId: user.studentId,
    },
    // 2.secret -> file env
    process.env.JWT_SECRET,
    // 3.option ในการสร้าง token
    // หมดอายุเมื่อไหร่
    { expiresIn: "8h" }
  );
  // ส่ง token กลับไปให้ user
  return NextResponse.json({ ok: true, token });
};
