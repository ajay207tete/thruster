exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Allow': 'GET',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const manifest = {
    url: "https://thruster-api.netlify.app",
    name: "Thruster",
    iconUrl: "https://chocolate-chemical-orangutan-457.mypinata.cloud/ipfs/bafybeig2ke6iowzphw7cxexu5o64k73tlaoph7vtpi2tsccbkexfryl37m",
    termsOfUseUrl: "https://thruster-api.netlify.app/terms",
    privacyPolicyUrl: "https://thruster-api.netlify.app/privacy"
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(manifest),
  };
};
