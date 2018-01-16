const sanitizer = (sanitization: (text: string) => string) =>
    (substrings: TemplateStringsArray, ...values: string[]) =>
        substrings.reduce((previous, current, index) => previous + current + sanitization(values[index] || ''), '');

const url = sanitizer(encodeURIComponent);

const delay = (millis: number) => new Promise<void>(resolve => setTimeout(resolve, millis));

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
                ipAddress: string;
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

export async function headers(query: { url: string }) {
    const response = await fetch(query.url);
    return {
        get(header: string) {
            const value = response.headers.get(header);
            if (!value) {
                return null;
            }
            return value.split(/;\s*/g).reduce((previous, current) => {
                if (current.includes('=')) {
                    const parts = current.split('=');
                    previous[parts[0]] = parts[1];
                } else if (current.includes(' ')) {
                    const parts = current.split(' ');
                    previous[parts[0]] = parts[1];
                } else {
                    previous[current] = null;
                }
                return previous;
            }, Object.create(null) as { [key: string]: string | null });
        }
    };
}

export async function caaRecordTags(query: { hostname: string }) {
    const response = await fetch(url`https://dns.google.com/resolve?name=${query.hostname}&type=CAA`);
    const json: { Answer: { data: string }[] } = await response.json();
    // records have structure: "flag tag value"
    // this function retrieves all configured tags
    return json.Answer.map(answer => answer.data.split(' ')[1]);
}
