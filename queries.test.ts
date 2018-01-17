import { sslTest, dnssec, headers } from './queries';

import test from 'ava';

test('SSL positive', async t => {
    const result = await sslTest({ host: 'google.com' });
    t.is(result.endpoints.length, 2);
    t.is(result.endpoints[0].grade, 'A');
    t.is(result.endpoints[1].grade, 'A');
    t.true(result.endpoints[0].details.supportsAlpn);
    t.true(result.endpoints[1].details.supportsAlpn);
});

test('DNSSEC positive', async t => {
    const result = await dnssec({ host: 'verisigninc.com' });
    t.true(result.secure);
});

test('DNSSEC negative', async t => {
    const result = await dnssec({ host: 'google.com' });
    t.false(result.secure);
});

test('Security headers positive', async t => {
    const result = await headers({ url: 'https://securityheaders.io' });
    const sts = result.get('strict-transport-security');
    if (!sts) {
        t.fail('STS header should be set.');
    } else {
        t.true('preload' in sts);
        t.true('includeSubDomains' in sts);
        t.true(Number(sts['max-age']) >= 31536000);
    }
});
