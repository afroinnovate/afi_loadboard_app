import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [{ title: 'LoadBoard APP' }, { name: 'description', content: 'Welcome to afroinnovate loadboard app' }];
};

export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <h1>AFI Load Board</h1>
      <h3>Unleashing the transformative power of efficiency, effectivenes, reliability and transparency</h3>
      <ul>
        <li>Efficiency</li>
        <li>Effectiveness</li>
        <li>Security</li>
        <li>Traceability</li>
        <li>Transparency</li>
        <li>Reliability</li>
        <li>Cost Savings</li>
        <li>In-App Communication</li>
        <li>Data-Driven Insights</li>
        <li>User-Friendly Experience</li>
      </ul>
    </div>
  );
}
