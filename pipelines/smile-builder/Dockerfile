FROM alpine

WORKDIR /smile-builder

COPY . .

RUN bin/smilectl docker_builder_deps

RUN rm -rf /smile-builder
