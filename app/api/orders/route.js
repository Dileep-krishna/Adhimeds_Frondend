// // app/api/orders/route.js
// import { NextResponse } from 'next/server';

// export async function POST(req) {
//   try {
//     const { items } = await req.json();
//     // Save to database, e.g., using Prisma, Mongoose, etc.
//     // For now, just log and return success
//     console.log('Order received:', items);
//     return NextResponse.json({ success: true, orderId: Date.now() });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }