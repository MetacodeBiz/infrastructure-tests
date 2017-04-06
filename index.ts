import { ipv6webserver, sslTest, dnssec } from './infr';

import * as assert from 'assert';

export async function testIpv6Positive() {
    const result = await ipv6webserver({ url: 'metacode.biz', scheme: 'https' });
    assert.equal(result.supports.ipv6, true);
    assert.notEqual(result.info.dns.AAAA.length, 0);
    assert.notEqual(result.info.site.title.length, 0);
}

export async function testSslPositive() {
    const result = await sslTest({ host: 'metacode.biz' });
    assert.equal(result.endpoints.length, 2);
    assert.equal(result.endpoints[0].grade, 'A+');
    assert.equal(result.endpoints[1].grade, 'A+');
    assert.ok(result.endpoints[0].details.supportsAlpn);
    assert.ok(result.endpoints[1].details.supportsAlpn);
}

export async function testDnssecPositive() {
    const result = await dnssec({ host: 'metacode.biz' });
    assert.ok(result.secure);
}
