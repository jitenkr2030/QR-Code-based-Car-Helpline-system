import { NextRequest, NextResponse } from 'next/server'
import { GET as handleWebSocketGET, POST as handleWebSocketPOST } from '@/lib/websocket'

export async function GET(request: NextRequest) {
  return handleWebSocketGET(request)
}

export async function POST(request: NextRequest) {
  return handleWebSocketPOST(request)
}