from index import handler


def test_python_function():
    resp = handler({}, None)
    assert resp == {'body': 'ami-0323c3dd2da7fb37d',
                    'headers': {'Content-Type': 'text/plain'}, 'statusCode': 200}
