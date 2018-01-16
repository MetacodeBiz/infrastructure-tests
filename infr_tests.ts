import { sslTest, dnssec, headers } from './infr';

import * as assert from 'assert';

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

export async function testHeadersPositive() {
    const result = await headers({ url: 'https://securityheaders.io' });
    const sts = result.get('strict-transport-security');
    if (!sts) {
        throw new assert.AssertionError({
            message: 'STS header should be set.'
        });
    } else {
        assert.ok('preload' in sts);
        assert.ok('includeSubDomains' in sts);
        assert.ok(Number(sts['max-age']) >= 31536000);
    }
}
