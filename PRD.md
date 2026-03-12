这是一个后台接口监控平台，定时监控后台接口是否正常以及返回值是否正常。
每次请求都会记录到mysql数据库中方便后续查询，
如果发现异常立即发送报警邮件到m18091286648@163.com邮箱

下面是数据库配置信息：
db_url: localhost
port: 3306
db_name: mb_agent
username: root
password: 123456

下面是邮箱SMTP配置信息：
POP3服务器: pop.163.com
SMTP服务器: smtp.163.com
IMAP服务器: imap.163.com
邮箱安全码： HYeyJ3BuKjf8cVba

监控接口：
1、下面的接口是获取所有租户信息，需要每5分钟执行一次，并将执行的结果存入数据库中以便后面的接口使用，该接口必定会返回租户信息，如果返回空数组则表示接口异常，此接口存在分页逻辑，如果有其他页码需要继续请求
postman request 'https://agent.mspbots.ai/apps/mb-platform-user/api/tenants' \
  --header 'authorization: Bearer eyJhbGciOiJFZERTQSJ9.eyJpZCI6ImY1YzQ1OGUxLWIxYWMtNDg1Ni1hMzk0LWI3NTYzMWRhYTcxMSIsImVtYWlsIjoidG9tLmxhbkBtc3Bib3RzLmFpIiwidGVuYW50SWQiOiI4YzljZmRiMy01OGY5LTQ0YmYtYTAwNS01N2NmMjMzMmYzMzIiLCJkaXNwbGF5TmFtZSI6IlRvbSBMYW4iLCJhdmF0YXJVcmwiOm51bGwsInJvbGVzIjpbInVzZXIiLCJhZG1pbiIsInN1cGVyQWRtaW4iXSwidGVuYW50Ijp7ImlkIjoiOGM5Y2ZkYjMtNThmOS00NGJmLWEwMDUtNTdjZjIzMzJmMzMyIiwibmFtZSI6Im1zcGJvdHMiLCJhZ2VudERvbWFpbiI6ImFnZW50Lm1zcGJvdHMuYWkiLCJ0aW1lem9uZUlkIjoiQ2VudHJhbCBTdGFuZGFyZCBUaW1lIiwidGltZXpvbmVOYW1lIjoiKFVUQy0wNjowMCkgQ2VudHJhbCBUaW1lIChVUyAmIENhbmFkYSkifSwiaWF0IjoxNzczMjg4NjcxLCJzdWIiOiJ0b2tlbiIsImV4cCI6MTc3NTg4MDY3MSwib3JpZ2luYWxUZW5hbnQiOnsiaWQiOiJlOWY3OTRmZS1hNmI0LTRmMzUtYmQyZi1mY2QxOWM1Y2MzMDgiLCJuYW1lIjoiTVNQYm90cy5haSIsImFnZW50RG9tYWluIjoiYWdlbnQubXNwYm90cy5haSIsInRpbWV6b25lSWQiOiJDZW50cmFsIFN0YW5kYXJkIFRpbWUiLCJ0aW1lem9uZU5hbWUiOiIoVVRDLTA2OjAwKSBDZW50cmFsIFRpbWUgKFVTICYgQ2FuYWRhKSJ9LCJvcmlnaW5hbFRlbmFudElkIjoiZTlmNzk0ZmUtYTZiNC00ZjM1LWJkMmYtZmNkMTljNWNjMzA4In0._inCACNgtIJTh3v9K9emfi5hCKj-rJS-Gu6DRYwo6qTeQy8-ub4cbF6NjXb6y0J-Nn3TK29yT4op6paEH7F3CA'
以下是接口返回的示例 
  {
    "code": 200,
    "data": {
        "tenants": [
            {
                "id": "8c9cfdb3-58f9-44bf-a005-57cf2332f332",
                "name": "mspbots",
                "slug": "mspbots",
                "agentDomain": "agent.mspbots.ai",
                "microsoftTenantId": "6e6c34dd-b003-4d25-bcb3-9e733bf76c9e",
                "microsoftTenantName": "mspbots",
                "microsoftDomain": "mspbots.onmicrosoft.com",
                "registrarEmail": null,
                "timezoneId": "China Standard Time",
                "timezoneName": "(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi",
                "timezoneOffset": 480,
                "isActive": true,
                "createdAt": "2026-03-11T16:15:03.833Z",
                "updatedAt": "2026-03-12T02:20:58.134Z",
                "userCount": 1
            }
        ],
        "total": 8,
        "page": 1,
        "pageSize": 20,
        "totalPages": 1
    }
}

2、下面的接口是获取某个租户下的agent列表信息，需要每5分钟执行一次，并将执行的结果存入数据库中如果返回正常则不存储返回结果只存储请求记录，如果接口报错则需要将报错写入请求结果字段中，该结果有可能返回空数组。但是mspbots.ai这个租户必定返回数据。该接口通过将header内cookie参数中的X_Tenant_ID字段替换为上一个接口返回租户数据中的id字段值来实现不同租户的请求
postman request 'https://agent.mspbots.ai/apps/mb-platform-agent/api/agents' \
  --header 'authorization: Bearer eyJhbGciOiJFZERTQSJ9.eyJpZCI6ImY1YzQ1OGUxLWIxYWMtNDg1Ni1hMzk0LWI3NTYzMWRhYTcxMSIsImVtYWlsIjoidG9tLmxhbkBtc3Bib3RzLmFpIiwidGVuYW50SWQiOiJlOWY3OTRmZS1hNmI0LTRmMzUtYmQyZi1mY2QxOWM1Y2MzMDgiLCJkaXNwbGF5TmFtZSI6IlRvbSBMYW4iLCJhdmF0YXJVcmwiOm51bGwsInJvbGVzIjpbInVzZXIiLCJhZG1pbiIsInN1cGVyQWRtaW4iXSwidGVuYW50Ijp7ImlkIjoiZTlmNzk0ZmUtYTZiNC00ZjM1LWJkMmYtZmNkMTljNWNjMzA4IiwibmFtZSI6Ik1TUGJvdHMuYWkiLCJhZ2VudERvbWFpbiI6ImFnZW50Lm1zcGJvdHMuYWkiLCJ0aW1lem9uZUlkIjoiQ2VudHJhbCBTdGFuZGFyZCBUaW1lIiwidGltZXpvbmVOYW1lIjoiKFVUQy0wNjowMCkgQ2VudHJhbCBUaW1lIChVUyAmIENhbmFkYSkifSwiaWF0IjoxNzczMjg4MTQwLCJzdWIiOiJ0b2tlbiIsImV4cCI6MTc3NTg4MDE0MH0.mShQCCbOrxrVXO6DFIePSOLKJYhyS1-HRoLfRQV_BOMRdDa-qTlJSqGxpGXWgy-VC_KS52DH8-OgB_kIaSfyDw' \
  --header 'cookie: Host=agent.mspbots.ai; X_Tenant_ID=8c9cfdb3-58f9-44bf-a005-57cf2332f332'
  
以下是接口返回的示例
{
    "success": true,
    "data": [
        {
            "id": "7eef3b92-0176-46b3-a597-24bb97d447c1",
            "name": "0001",
            "type": "Executor",
            "category": "Operations",
            "status": "Active",
            "version": "1.0.0",
            "description": null,
            "routeUrl": null,
            "accessToken": "-wnIgo7FrEcJzlL-ocm5a8MkFLMrruQD",
            "aieosContent": {
                "history": {
                    "version": "1.0",
                    "created_at": "2026-03-12",
                    "occupation": "29lxyhbtkw72"
                },
                "identity": {
                    "bio": "",
                    "names": {
                        "first": "29lxyhbtkw72",
                        "nickname": "0001"
                    },
                    "avatar_url": null
                },
                "psychology": {
                    "traits": [],
                    "neural_matrix": {
                        "empathy": 0.8,
                        "precision": 0.85,
                        "reasoning": 0.9,
                        "creativity": 0.7
                    }
                },
                "linguistics": {
                    "tone": "professional_friendly",
                    "formality": 0.6,
                    "primary_language": "zh-CN",
                    "secondary_languages": []
                },
                "motivations": {
                    "goals": [],
                    "core_drive": ""
                },
                "capabilities": {
                    "tools": [],
                    "skills": [],
                    "permissions": [
                        {
                            "actions": [
                                "READ",
                                "UPDATE"
                            ],
                            "resource": "AGENTS_SELF"
                        }
                    ]
                },
                "connectivity": {
                    "llm": null,
                    "nostr": null,
                    "mspbots": {
                        "token": "-wnIgo7FrEcJzlL-ocm5a8MkFLMrruQD",
                        "enabled": true,
                        "tenant_id": "8c9cfdb3-58f9-44bf-a005-57cf2332f332"
                    },
                    "telegram": {
                        "token": "",
                        "enabled": false
                    }
                },
                "spec_version": "1.1"
            },
            "containerId": "29lxyhbtkw72",
            "nanobotId": "29lxyhbtkw72",
            "tokenId": "42ca3a937924b8f91a6009b56459b5dcf671c1ad95c863d9536d87b15dc637eb",
            "runtimeConfig": {
                "note": "Production Agent",
                "model": "gemini-3-pro-preview",
                "agent_id": "29lxyhbtkw72",
                "providers": {
                    "custom:https://aigateway.mspbots.ai/v1": {
                        "api_key": "sk-S-RIopZ1J6p5LOPH8Na7MQ"
                    }
                },
                "tenant_id": "8c9cfdb3-58f9-44bf-a005-57cf2332f332",
                "mspbots_token": "-wnIgo7FrEcJzlL-ocm5a8MkFLMrruQD",
                "telegram_token": "",
                "telegram_enabled": "false"
            },
            "lastRunTime": null,
            "createdBy": "token",
            "updatedBy": "token",
            "createdAt": "2026-03-12T06:35:03.254Z",
            "updatedAt": "2026-03-12T06:35:03.254Z"
        }
    ],
    "count": 1
}