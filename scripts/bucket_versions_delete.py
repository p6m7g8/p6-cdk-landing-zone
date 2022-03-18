#!/usr/bin/env python

"""Usage:
        bucket_versions_delete.py --bucket BUCKET

Deletes all version of all objects from BUCKET

Arguments:
  BUCKET      s3 bucket to delete from

Options:
  -h --help
  --bucket BUCKET
"""

from docopt import docopt
import sys
import boto3


def main(args):
    """
    """

    session = boto3.Session()
    s3 = session.resource(service_name='s3')

    bucket = s3.Bucket(args['--bucket'])
    bucket.object_versions.delete()

    bucket.delete()


if __name__ == '__main__':
    arguments = docopt(__doc__, options_first=True, version="0.0.1")
    sys.exit(main(arguments))
