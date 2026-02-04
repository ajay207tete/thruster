import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const manifest = {
    url: "http://localhost:8081",
    name: "Thruster",
    iconUrl: "https://chocolate-chemical-orangutan-457.mypinata.cloud/ipfs/bafybeig2ke6iowzphw7cxexu5o64k73tlaoph7vtpi2tsccbkexfryl37m"
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
