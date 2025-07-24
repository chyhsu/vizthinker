class user:
    def __init__(self, id, username, password):
        self.id = id
        self.username = username
        self.password = password
        self.chats = []
class chat:
    def __init__(self, id, user_id):
        self.id = id
        self.user_id = user_id
        self.messages = []
class message:
    def __init__(self, id, chat_id, prompt, response,isBranch,position,parent_id):
        self.id = id
        self.chat_id = chat_id
        self.prompt = prompt
        self.position = position
        self.parent_id = parent_id
        self.response = response
        self.isBranch = isBranch
