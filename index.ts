import { http2query, ipv6webserver, sslTest } from './infr';

import * as assert from 'assert';

export async function testHttp20Positive() {
    const result = await http2query({ url: 'metacode.biz' });
    assert.equal(result.supports.http20, true);
    assert.equal(result.supports.alpn, true, 'Must support ALPN');
}

export async function testIpv6Positive() {
    const result = await ipv6webserver({ url: 'metacode.biz', scheme: 'https' });
    assert.equal(result.supports.ipv6, true);
    assert.notEqual(result.info.dns.AAAA.length, 0);
    assert.notEqual(result.info.site.title.length, 0);
}

export async function testSslPositive() {
    const result = await sslTest({ host: 'metacode.biz' });
    assert.equal(result.info.ssl.grades.length, 2);
    assert.equal(result.info.ssl.grades[0], 'A+');
    assert.equal(result.info.ssl.grades[1], 'A+');
}
