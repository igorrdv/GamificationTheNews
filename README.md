## Passo a passo para rodar a aplicação:

Abra o terminal e digite:

```
cd backend
```

> Em seguida digite:

```
npm install
```

> Então:

```
npx prisma generate
```

> Se quiser salvar criar um histórico de migrations digite:

```

npx prisma migrate dev --name init
```

# Volte e mude para a pasta Frontend

```
cd frontend
```

> Digite novamente o comando

```
npm install
```

# Pronto, o projeto está instalado!

## Como rodar o projeto:

Na pasta backend:

```
npm run dev
```

Agora mude para a pasta frontend em outro terminal e digite:

```
npm run dev
```

Pronto, o projeto está rodando em sua máquina. Abra no link que aparece em seu terminal, ou pelo link http://localhost:5173/

## Rotas disponíveis no projeto:

- /
- /dashboard
- /admin

## Para inserir dados no sistema:

```
Envie um POST para http://localhost:3000/api/webhook Com o seguinte body: {
  "data": {
    "id": "sub_1740061079814",
    "email": "usuariodeteste@email.com",
    "status": "active",
    "utm_source": "",
    "utm_medium": "",
    "utm_campaign": "",
    "utm_channel": "",
    "referring_site": "",
    "created_at": "2025-02-24T00:00:00.814Z"
  }
}
```

## Para puxar dados no sistema:

```
Envie o método GET para:
http://localhost:3000/api/users/usuariodeteste@email.com (Email usado no método POST anterior)

```
