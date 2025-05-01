from neo4j import GraphDatabase

uri = "neo4j+s://351693bf.databases.neo4j.io"
user = "neo4j"
password = "btb1HhnEYqIle5KbdkECCfDfFjkH_HvtJj-Av1ekI00"

driver = GraphDatabase.driver(uri, auth=(user, password))

try:
    with driver.session() as session:
        result = session.run("RETURN 1")
        print("Connected Successfully ✅")
except Exception as e:
    print("Error connecting to Neo4j:", e)

driver.close()
