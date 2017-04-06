import { ipv6webserver, sslTest, dnssec, headers } from './infr';

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

export async function testHeadersPositive() {
    const result = await headers({ url: 'https://metacode.biz' });

    // Strict-Transport-Security
    const sts = result.get('strict-transport-security');
    if (!sts) {
        throw new assert.AssertionError('STS header should be set.');
    } else {
        assert.ok('preload' in sts, 'STS must be preloaded');
        assert.ok('includeSubDomains' in sts, 'STS must include subdomains.');
        assert.ok(Number(sts['max-age']) >= 31536000, 'STS must be valid for long time.');
    }

    // X-XSS-Protection
    const xss = result.get('x-xss-protection');
    if (!xss) {
        throw new assert.AssertionError('XSS header should be set.');
    } else {
        assert.ok('1' in xss, 'XSS must be enabled.');
        assert.equal('block', xss['mode'], 'XSS must be in mode block.');
        assert.ok('report' in xss, 'XSS report url must be present.');
    }

    // X-Content-Type-Options
    const cto = result.get('x-content-type-options');
    if (!cto) {
        throw new assert.AssertionError('XCTO header should be set.');
    } else {
        assert.ok('nosniff' in cto, 'XCTO must be enabled.');
    }

    // X-Frame-Options
    const xfo = result.get('x-frame-options');
    if (!xfo) {
        throw new assert.AssertionError('XFO header should be set.');
    } else {
        assert.ok('DENY' in xfo, 'XFO must be enabled.');
    }

}
