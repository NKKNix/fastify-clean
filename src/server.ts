import 'dotenv/config';
import Fastify from 'fastify';
import { userRoute } from './gateways/route';

const app = Fastify();

app.register(userRoute);

app.listen({ port: Number(process.env.PORT) }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});
