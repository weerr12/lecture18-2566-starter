import { NextResponse } from "next/server";

//POST /api/user/login
export const POST = async (request) => {
  const body = await request.json();
  const { username, password } = body;

  // return NextResponse.json(
  //   {
  //     ok: false,
  //     message: "Username or password is incorrect",
  //   },
  //   { status: 400 }
  // );

  return NextResponse.json({ ok: true });
};
