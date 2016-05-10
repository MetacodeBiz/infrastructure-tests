import { http2query, ipv6webserver, sslTest } from './infr';

const assert = console.assert;

export async function testHttp20Positive() {
    const result = await http2query({ url: 'metacode.biz' });
    assert(result.supports.http20 === true);
}

export async function testIpv6Positive() {
    const result = await ipv6webserver({ url: 'metacode.biz', scheme: 'https' });
    assert(result.supports.ipv6 === true);
    assert(result.info.dns.AAAA.length > 0);
    assert(result.info.site.title.length > 0);
}

export async function testSslPositive() {
    const result = await sslTest({ host: 'metacode.biz' });
    assert(result.info.ssl.grades.length === 2);
    assert(result.info.ssl.grades[0] === 'A+');
    assert(result.info.ssl.grades[1] === 'A+');
}
