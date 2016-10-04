const sanitizer = (sanitization: (text: string) => string) =>
    (substrings: string[], ...values: string[]) =>
        substrings.reduce((previous, current, index) => previous + current + sanitization(values[index] || ''), '');

const url = sanitizer(encodeURIComponent);

const delay = (millis: number) => new Promise<void>(resolve => setTimeout(resolve, millis));

export async function http2query(query: { url: string }) {
    const response = await fetch(url`https://tools.keycdn.com/http2-query.php?url=${query.url}`);
    const text = await response.text();
    return {
        supports: {
            http20: text.includes('supports <strong>HTTP/2.0</strong>'),
            alpn: text.includes('<strong>ALPN</strong> supported')
        }
    };
}

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
    let json: { status: 'IN_PROGRESS' | 'READY', endpoints: { grade: 'A+' | 'A' | 'C' | 'F' | 'T' }[] };
    let startNew = 'on';
    while (!json || json.status !== 'READY') {
        const response = await fetch(url`https://api.ssllabs.com/api/v2/analyze?host=${query.host}&startNew=${startNew}`);
        json = await response.json();
        if (json.status !== 'READY') {
            await delay(10000);
        }
        startNew = 'off';
    }
    return {
        info: {
            ssl: {
                grades: json.endpoints.map(endpoint => endpoint.grade)
            }
        }
    };
}

export async function dnssec(query: { host: string }) {
    const response = await fetch(url`https://dnssec-name-and-shame.com/name-shame/?domainname=${query.host}`);
    const json: { status: 'secure' | 'insecure' } = await response.json();
    return {
        secure: json.status === 'secure'
    };
}
