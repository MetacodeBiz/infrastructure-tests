import { ipv6webserver, sslTest, dnssec, headers } from './infr';

import * as assert from 'assert';

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
    assert.equal(result.endpoints.length, 2);
    assert.equal(result.endpoints[0].grade, 'A');
    assert.equal(result.endpoints[1].grade, 'A');
    assert.ok(result.endpoints[0].details.supportsAlpn);
    assert.ok(result.endpoints[1].details.supportsAlpn);
}

export async function testDnssecPositive() {
    const result = await dnssec({ host: 'verisigninc.com' });
    assert.equal(result.secure, true);
}

export async function testDnssecNegative() {
    const result = await dnssec({ host: 'google.com' });
    assert.equal(result.secure, false);
}
