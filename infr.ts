const sanitizer = (sanitization: (text: string) => string) =>
    (substrings: TemplateStringsArray, ...values: string[]) =>
        substrings.reduce((previous, current, index) => previous + current + sanitization(values[index] || ''), '');

const url = sanitizer(encodeURIComponent);

const delay = (millis: number) => new Promise<void>(resolve => setTimeout(resolve, millis));

export async function ipv6webserver(query: { url: string, scheme: 'http' | 'https' }) {
    const response = await fetch(url`http://ipv6-test.com/json/webserver.php?url=${query.url}&scheme=${query.scheme}`);
    const json: { dns_aaaa: string; server: string; title: string } = await response.json();
    return {
        supports: {
            ipv6: !('error' in json)
        },
        info: {
            dns: {
                AAAA: json.dns_aaaa
            },
            site: {
                title: json.title
            }
        }
    };
}

export async function sslTest(query: { host: string }) {
    let json: { status: 'IN_PROGRESS' | 'READY', endpoints: { ipAddress: string }[] } = { status: 'IN_PROGRESS', endpoints: [] };
    let startNew = 'on';
    while (json.status !== 'READY') {
        const response = await fetch(url`https://api.ssllabs.com/api/v2/analyze?host=${query.host}&startNew=${startNew}`);
        json = await response.json();
        if (json.status !== 'READY') {
            await delay(10000);
        }
        startNew = 'off';
    }
    return {
        endpoints: await Promise.all(json.endpoints.map(endpoint =>
            fetch(url`https://api.ssllabs.com/api/v2/getEndpointData?host=${query.host}&s=${endpoint.ipAddress}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Getting endpoint details failed: ' + response.statusText);
                }
                return response.json();
            }))) as any as {
                grade: 'A+' | 'A' | 'F' | 'T';
                details: {
                    supportsAlpn: true
                }
            }[]
    };
}

export async function dnssec(query: { host: string }) {
    const response = await fetch(url`https://dnssec-name-and-shame.com/name-shame/?domainname=${query.host}`);
    const json: { status: 'secure' | 'insecure' } = await response.json();
    return {
        secure: json.status === 'secure'
    };
}
