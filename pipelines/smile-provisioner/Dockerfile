FROM 121789937014.dkr.ecr.us-east-1.amazonaws.com/trexsolutions/smile-builder

WORKDIR /smile

COPY . .

RUN yarn install
RUN npx projen build
