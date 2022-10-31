1. Backup production db

  ```
  db.adminCommand({
     copydb: 1,
     fromdb: "elneto",
     todb: "elneto_backup"
  })
  ```

2. Stop elento server

  ```
  pm2 stop elneto
  ```

3. Delete Production db

  ```
  use elneto
  db.dropDatabase()
  ```

4. Copy db

  ```
  db.adminCommand({
     copydb: 1,
     fromdb: "elneto_dev",
     todb: "elneto"
  })
  ```
  
5. Start elneto server

  ```
  pm2 start elneto
  ```
