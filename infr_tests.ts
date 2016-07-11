import { http2query, ipv6webserver, sslTest } from './infr';

import * as assert from 'assert';

export async function testHttp20Negative() {
    const result = await http2query({ url: 'example.com' });
    assert.equal(result.supports.http20, false);
    assert.equal(result.supports.alpn, false);
}

export async function testHttp20Positive() {
    const result = await http2query({ url: 'google.com' });
    assert.equal(result.supports.http20, true);
    assert.equal(result.supports.alpn, true);
}

export async function testIpv6Negative() {
    const result = await ipv6webserver({ url: 'zaxo.biz', scheme: 'http' });
    assert.equal(result.supports.ipv6, false);
}

export async function testIpv6Positive() {
    const result = await ipv6webserver({ url: 'example.com', scheme: 'http' });
    assert.equal(result.supports.ipv6, true);
    assert.notEqual(result.info.dns.AAAA.length, 0);
    assert.equal(result.info.site.title, 'Example Domain');
}

export async function testSslPositive() {
    const result = await sslTest({ host: 'google.com' });
    assert.equal(result.info.ssl.grades.length, 2);
    assert.equal(result.info.ssl.grades[0], 'A');
    assert.equal(result.info.ssl.grades[1], 'A');
}
