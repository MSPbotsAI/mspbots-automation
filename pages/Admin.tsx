import { useState } from "react";
import { $fetch } from "@mspbots/fetch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Textarea,
  Label,
  ScrollArea,
} from "@mspbots/ui";

export const meta = {
  label: 'Admin',
  icon: 'Lock',
  order: 2,
  menu: ['admin'],
  route: (roles) => roles.includes('test'),
}

function ApiTestTab({ title, description, method, url, params, body, onResponse }: {
  title: string;
  description: string;
  method: string;
  url: string;
  params: Record<string, string>;
  body?: string;
  onResponse: (response: any) => void;
}) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [requestBody, setRequestBody] = useState(body || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let fullUrl = url;
      Object.keys(params).forEach(key => {
        fullUrl = fullUrl.replace(`:${key}`, inputs[key] || '');
      });
      const query = Object.fromEntries(Object.entries(inputs).filter(([k]) => !params[k]));
      const options: any = { method };
      if (method !== 'GET') {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = requestBody;
      }
      if (Object.keys(query).length > 0) {
        const searchParams = new URLSearchParams(query);
        fullUrl += '?' + searchParams.toString();
      }
      const response = await $fetch(fullUrl, options);
      const data = await response.json();
      onResponse({ status: response.status, data });
    } catch (error) {
      onResponse({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardDescription className="text-xs text-muted-foreground mt-2">{method} {url}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.keys(params).map(key => (
          <div key={key}>
            <Label>{key}</Label>
            <Input
              value={inputs[key] || ''}
              onChange={(e) => setInputs({ ...inputs, [key]: e.target.value })}
              placeholder={`Enter ${key}`}
            />
          </div>
        ))}
        {Object.keys(params).length === 0 && (
          <div>
            <Label>Query Params (key=value, one per line)</Label>
            <Textarea
              value={Object.entries(inputs).map(([k, v]) => `${k}=${v}`).join('\n')}
              onChange={(e) => {
                const lines = e.target.value.split('\n');
                const newInputs: Record<string, string> = {};
                lines.forEach(line => {
                  const [k, v] = line.split('=');
                  if (k && v) newInputs[k.trim()] = v.trim();
                });
                setInputs(newInputs);
              }}
              placeholder="page=1\npageSize=10"
              className="min-h-24"
            />
          </div>
        )}
        {method !== 'GET' && (
          <div>
            <Label>Request Body (JSON)</Label>
            <Textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              placeholder='{"key": "value"}'
              className="min-h-32"
            />
          </div>
        )}
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Testing...' : 'Test API'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const [responses, setResponses] = useState<Record<string, any>>({});

  const apis = [
    {
      id: 'get-tenants',
      title: '获取租户列表',
      description: '获取所有租户的列表',
      method: 'GET',
      url: '/api/monitor/tenants',
      params: { page: '', pageSize: '' }
    },
    {
      id: 'get-token',
      title: '获取租户Token',
      description: '为指定租户获取认证token',
      method: 'POST',
      url: 'https://agent.mspbots.ai/apps/mb-platform-user/api/auth/token',
      params: {},
      body: JSON.stringify({
        id: "f5c458e1-b1ac-4856-a394-b75631daa711",
        email: "tom.lan@mspbots.ai",
        tenantId: "ebbc8cf8-7a74-4158-a08c-41c884886707",
        displayName: "Tom Lan",
        roles: ["user", "admin", "dev", "superAdmin"],
        tenant: {
          id: "ebbc8cf8-7a74-4158-a08c-41c884886707",
          name: "test-tenant"
        }
      }, null, 2)
    },
    {
      id: 'get-agents',
      title: '获取Agent列表',
      description: '为指定租户获取agent列表（需要先获取该租户的token）',
      method: 'GET',
      url: '/api/agents',
      params: { tenantId: '' }
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API 测试</h1>
        <p className="text-muted-foreground mt-2">手动测试租户、Token和Agent接口逻辑</p>
      </div>

      <div className="space-y-6">
        {apis.map((api, index) => (
          <div key={api.id}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                {index + 1}
              </div>
              <h2 className="text-lg font-semibold">{api.title}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <ApiTestTab
                title={api.title}
                description={api.description}
                method={api.method}
                url={api.url}
                params={api.params}
                body={api.body}
                onResponse={(response) => setResponses({ ...responses, [api.id]: response })}
              />
              <Card>
                <CardHeader>
                  <CardTitle>响应结果</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 w-full rounded-md border p-4">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                      {JSON.stringify(responses[api.id], null, 2) || '等待测试...'}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            {index < apis.length - 1 && <div className="my-8 border-t" />}
          </div>
        ))}
      </div>
    </div>
  );
}

