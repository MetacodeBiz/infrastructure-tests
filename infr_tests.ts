import { http2query, ipv6webserver, sslTest } from './infr';

const assert = console.assert;

export async function testHttp20Negative() {
    const result = await http2query({ url: 'example.com' });
    assert(result.supports.http20 === false);
    assert(result.supports.alpn === false);
}

export async function testHttp20Positive() {
    const result = await http2query({ url: 'google.com' });
    assert(result.supports.http20 === true);
    assert(result.supports.alpn === true);
}

export async function testIpv6Negative() {
    const result = await ipv6webserver({ url: 'zaxo.biz', scheme: 'http' });
    assert(result.supports.ipv6 === false);
}

export async function testIpv6Positive() {
    const result = await ipv6webserver({ url: 'example.com', scheme: 'http' });
    assert(result.supports.ipv6 === true);
    assert(result.info.dns.AAAA.length > 0);
    assert(result.info.site.title === 'Example Domain');
}

export async function testSslNegative() {
    const result = await sslTest({ host: 'expired.badssl.com' });
    assert(result.info.ssl.grades.length === 1);
    assert(result.info.ssl.grades[0] === 'T');
}

export async function testSslPositive() {
    const result = await sslTest({ host: 'sha256.badssl.com' });
    assert(result.info.ssl.grades.length === 1);
    assert(result.info.ssl.grades[0] === 'C');
}
