import { DB } from "@/app/libs/DB";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
// api debug ส่งข้อมูลทั้งหมดใน DB ออกมา
export const GET = async (request) => {
  // ดูวิชาของเจ้าของ token -> step 1 อ่าน token มาให้ได้ก่อน
  // import headers ด้วย
  const rawAuthHeader = headers().get("authorization");
  // ลบคำว่า Bearer ทิ้งไป ที่เราไปแปะ
  const token = rawAuthHeader.split(" ")[1];
  // การแนบ token ก็อป token จาก login ไปวางใน GET enroll แปะใน Auth -> Bearer Token วางตรง Token เลย
  // ย่อ ไปสร้าง ตัวแปร token เพิ่มใน ฟันเฟือง แล้วเอา token ไปแปะ -> เวลาเรียกใช้ {{token}}
  let studentId = null;

  // ดูว่า token จริงหรือเปล่า
  // ทดสอบว่า token เนี่ยเป็น token ที่ถูกสร้างด้วย secret อันเนี่ยเปล่า ->token, process.env.JWT_SECRET
  // try catch -> ดัก runtime error ถ้าตรง try error กระโดดไปที่ catch เลย
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // ถ้าเอา payload ออกมาได้
    // เราจะดึง studentId ของคนที่ login ออกมาดู
    studentId = payload.studentId;
    // ผลลัพธ์
    // {
    //   "ok": true,
    //   "courseNoList": [
    //     "261207",
    //     "001101"
    //   ]
    // }
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  const courseNoList = [];
  for (const enroll of DB.enrollments) {
    if (enroll.studentId === studentId) {
      courseNoList.push(enroll.courseNo);
    }
  }
  return NextResponse.json({
    ok: true,
    courseNoList,
  });
};

export const POST = async (request) => {
  const rawAuthHeader = headers().get("authorization");
  const token = rawAuthHeader.split(" ")[1];
  let studentId = null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    studentId = payload.studentId;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }
  //read body request
  const body = await request.json();
  const { courseNo } = body;
  if (typeof courseNo !== "string" || courseNo.length !== 6) {
    return NextResponse.json(
      {
        ok: false,
        message: "courseNo must contain 6 characters",
      },
      { status: 400 }
    );
  }

  //check if courseNo exists
  const foundCourse = DB.courses.find((x) => x.courseNo === courseNo);
  if (!foundCourse) {
    return NextResponse.json(
      {
        ok: false,
        message: "courseNo does not exist",
      },
      { status: 400 }
    );
  }

  //check if student enrolled that course already
  const foundEnroll = DB.enrollments.find(
    (x) => x.studentId === studentId && x.courseNo === courseNo
  );
  if (foundEnroll) {
    return NextResponse.json(
      {
        ok: false,
        message: "You already enrolled that course",
      },
      { status: 400 }
    );
  }

  //if code reach here. Everything is fine.
  //Do the DB saving
  DB.enrollments.push({
    studentId,
    courseNo,
  });

  return NextResponse.json({
    ok: true,
    message: "You has enrolled a course successfully",
  });
};
