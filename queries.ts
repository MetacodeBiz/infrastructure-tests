const sanitizer = (sanitization: (text: string) => string) =>
    (substrings: TemplateStringsArray, ...values: string[]) =>
        substrings.reduce((previous, current, index) => previous + current + sanitization(values[index] || ''), '');

const url = sanitizer(encodeURIComponent);

const delay = (millis: number) => new Promise<void>(resolve => setTimeout(resolve, millis));

import fetch from 'node-fetch';

export async function sslTest(query: { host: string }) {
    // see:
    // https://github.com/ssllabs/ssllabs-scan/blob/master/ssllabs-api-docs-v3.md#invoke-assessment-and-check-progress
    interface SslLabsResponse {
        status: 'IN_PROGRESS' | 'READY',
        endpoints: {
            ipAddress: string;
            grade: 'A+' | 'A' | 'F' | 'T';
            details: {
                supportsAlpn: true
            }
        }[]
    };
    let startNew = 'on';
    do {
        const response = await fetch(url`https://api.ssllabs.com/api/v2/analyze?host=${query.host}&startNew=${startNew}&all=done`);
        const json = await response.json() as SslLabsResponse;
        if (json.status === 'READY') {
            return {
                endpoints: json.endpoints
            };
        }
        await delay(10000);
        startNew = 'off';
    } while (true);
}

export async function dnssec(query: { host: string }) {
    const response = await fetch(url`https://dns.google.com/resolve?name=${query.host}`);
    // see: https://developers.google.com/speed/public-dns/docs/dns-over-https#dns_response_in_json
    const json: { AD: boolean } = await response.json();
    return {
        secure: json.AD
    };
}

export async function headers(query: { url: string }) {
    const response = await fetch(query.url);
    return {
        get(header: string) {
            const value = response.headers.get(header) as string;
            return value.split(/;\s*/g).reduce((previous, current) => {
                if (current.includes('=')) {
                    const parts = current.split('=');
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

export async function dmarcSpf(query: { hostname: string }) {
    const response = await fetch(url`https://app.valimail.com/domain_checker/v1/status/${query.hostname}.json`);
    const json: { status: { [metric: string]: 'ok' | 'warning' | 'error' } } = await response.json();
    return Object.values(json.status).every(value => value === 'ok');
}
