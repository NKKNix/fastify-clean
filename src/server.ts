import Fastify from 'fastify';
import { userRoute } from './gateways/route';

const app = Fastify();

app.register(userRoute);

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server running at ${address}`);
});
